#!/usr/bin/env python3
"""Mac-side direct deploy tool for the Gen1 VVX runtime host."""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any


DEFAULT_BASE_URL = "http://192.168.86.240:8040/"
DEFAULT_DEVICE_ID = "8813bfdaa0c0"
DEFAULT_MANIFEST = "rt/devices/8813bfdaa0c0.json"
DEFAULT_UPLOAD_CHUNK_BYTES = 1500
DEFAULT_TIMEOUT_SECONDS = 5.0
STATE_TEXT_ID = 200
INSTALLER_SCRIPT_ID = 1
MASTER_SCRIPT_ID = 3


class DeployError(Exception):
    """Raised when direct deploy cannot safely continue."""


@dataclass(frozen=True)
class BuiltScript:
    role: str
    script_id: int
    name: str
    boot: bool
    code: str
    byte_count: int


def repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def normalize_base_url(base_url: str) -> str:
    value = str(base_url or "").strip()
    if not value:
        raise DeployError("base URL is required")
    return value.rstrip("/")


def normalized_id(value: Any) -> str:
    return "".join(ch for ch in str(value or "").lower() if ch.isalnum())


def rpc_call(
    base_url: str,
    method: str,
    params: dict[str, Any] | None = None,
    timeout: float = DEFAULT_TIMEOUT_SECONDS,
) -> Any:
    payload: dict[str, Any] = {"id": 1, "method": method}
    if params is not None:
        payload["params"] = params
    body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    request = urllib.request.Request(
        normalize_base_url(base_url) + "/rpc",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as exc:
        raise DeployError(f"RPC {method} failed: {exc}") from exc
    except json.JSONDecodeError as exc:
        raise DeployError(f"RPC {method} returned invalid JSON") from exc

    if not isinstance(data, dict):
        raise DeployError(f"RPC {method} returned non-object response")
    if "error" in data:
        raise DeployError(f"RPC {method} returned error: {data['error']}")
    return data.get("result")


def verify_device(base_url: str, expected_id: str) -> dict[str, Any]:
    info = rpc_call(base_url, "Shelly.GetDeviceInfo")
    if not isinstance(info, dict):
        raise DeployError("Shelly.GetDeviceInfo returned non-object result")
    live = normalized_id(info.get("id") or info.get("mac"))
    wanted = normalized_id(expected_id)
    if not live.endswith(wanted):
        raise DeployError(f"target mismatch: expected {expected_id}, got {info.get('id')!r}")
    return info


def script_list(base_url: str) -> list[dict[str, Any]]:
    result = rpc_call(base_url, "Script.List")
    scripts = result.get("scripts") if isinstance(result, dict) else result
    if not isinstance(scripts, list):
        raise DeployError("Script.List returned no scripts list")
    for script in scripts:
        if not isinstance(script, dict):
            raise DeployError("Script.List contains non-object entries")
    return scripts


def script_by_id(scripts: list[dict[str, Any]], script_id: int) -> dict[str, Any] | None:
    for script in scripts:
        if script.get("id") == script_id:
            return script
    return None


def read_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise DeployError(f"missing file: {path}") from exc
    except json.JSONDecodeError as exc:
        raise DeployError(f"invalid JSON: {path}") from exc
    if not isinstance(value, dict):
        raise DeployError(f"JSON root is not an object: {path}")
    return value


def safe_repo_path(root: Path, raw_path: str) -> Path:
    if not isinstance(raw_path, str) or not raw_path:
        raise DeployError("path must be a non-empty string")
    path = Path(raw_path)
    if path.is_absolute():
        raise DeployError(f"absolute path is not allowed: {raw_path}")
    resolved_root = root.resolve()
    resolved_path = (root / path).resolve()
    if resolved_path != resolved_root and resolved_root not in resolved_path.parents:
        raise DeployError(f"path escapes repository: {raw_path}")
    if not resolved_path.is_file():
        raise DeployError(f"file does not exist: {raw_path}")
    return resolved_path


def load_manifest(root: Path, manifest_path: str) -> dict[str, Any]:
    manifest = read_json(safe_repo_path(root, manifest_path))
    if not isinstance(manifest.get("device_version"), int):
        raise DeployError("manifest device_version must be an integer")
    scripts = manifest.get("scripts")
    if not isinstance(scripts, list) or not scripts:
        raise DeployError("manifest scripts must be a non-empty list")
    return manifest


def split_upload_chunks(code: str, chunk_bytes: int) -> list[str]:
    if chunk_bytes < 1:
        raise DeployError("upload chunk bytes must be positive")
    if code == "":
        return [""]
    chunks: list[str] = []
    current = ""
    for char in code:
        candidate = current + char
        if current and len(candidate.encode("utf-8")) > chunk_bytes:
            chunks.append(current)
            current = char
        else:
            current = candidate
        if len(current.encode("utf-8")) > chunk_bytes:
            raise DeployError("one character exceeds upload chunk bytes")
    if current:
        chunks.append(current)
    return chunks


def build_script(root: Path, entry: dict[str, Any]) -> BuiltScript:
    role = entry.get("role")
    script_id = entry.get("id")
    name = entry.get("name")
    recipe_path = entry.get("recipe")
    boot = bool(entry.get("boot", False))
    if not isinstance(role, str) or not role:
        raise DeployError("script role must be a non-empty string")
    if not isinstance(script_id, int):
        raise DeployError(f"{role}: script id must be an integer")
    if not isinstance(name, str) or not name:
        raise DeployError(f"{role}: name must be a non-empty string")
    if not isinstance(recipe_path, str) or not recipe_path:
        raise DeployError(f"{role}: recipe must be a non-empty string")

    recipe = read_json(safe_repo_path(root, recipe_path))
    chunks = recipe.get("chunks")
    if not isinstance(chunks, list) or not chunks:
        raise DeployError(f"{role}: recipe has no chunks")

    parts = []
    for raw_chunk in chunks:
        chunk_path = safe_repo_path(root, raw_chunk)
        parts.append(chunk_path.read_text(encoding="utf-8"))
    code = "".join(parts)
    return BuiltScript(role, script_id, name, boot, code, len(code.encode("utf-8")))


def build_scripts(root: Path, manifest: dict[str, Any], roles: set[str] | None) -> list[BuiltScript]:
    built = []
    for entry in manifest["scripts"]:
        if not isinstance(entry, dict):
            raise DeployError("manifest script entry is not an object")
        role = entry.get("role")
        if roles is not None and role not in roles:
            continue
        built.append(build_script(root, entry))
    if not built:
        raise DeployError("no scripts selected")
    return built


def assert_expected_slots(base_url: str, scripts: list[BuiltScript]) -> None:
    live = script_list(base_url)
    missing = []
    wrong_names = []
    for script in scripts:
        entry = script_by_id(live, script.script_id)
        if entry is None:
            missing.append(f"{script.role}:#{script.script_id}")
        else:
            live_name = str(entry.get("name") or "")
            valid_live_name = live_name in {script.name, script.role} or live_name.startswith(script.role + "_v")
            if not valid_live_name:
                wrong_names.append(f"{script.role}:#{script.script_id} live={entry.get('name')!r} target={script.name!r}")
    if missing:
        raise DeployError("expected fixed script ids are missing: " + ", ".join(missing))
    if wrong_names:
        raise DeployError("unexpected script names on fixed ids: " + "; ".join(wrong_names))


def stop_script(base_url: str, script_id: int) -> None:
    try:
        rpc_call(base_url, "Script.Stop", {"id": script_id})
    except DeployError as exc:
        if "not found" not in str(exc).lower():
            raise
    time.sleep(0.08)


def set_script_config(base_url: str, script: BuiltScript) -> None:
    rpc_call(base_url, "Script.SetConfig", {"id": script.script_id, "config": {"name": script.name, "enable": script.boot}})


def put_script_code(base_url: str, script: BuiltScript, upload_chunk_bytes: int) -> int:
    chunks = split_upload_chunks(script.code, upload_chunk_bytes)
    for index, chunk in enumerate(chunks):
        rpc_call(base_url, "Script.PutCode", {"id": script.script_id, "code": chunk, "append": index > 0})
        time.sleep(0.12)
    return len(chunks)


def stop_runtime(base_url: str, include_installer: bool) -> None:
    ids = [3, 4, 5, 6, 7, 8, 9, 2]
    if include_installer:
        ids.insert(0, INSTALLER_SCRIPT_ID)
    for script_id in ids:
        stop_script(base_url, script_id)


def deploy_one(base_url: str, script: BuiltScript, upload_chunk_bytes: int) -> dict[str, Any]:
    stop_script(base_url, script.script_id)
    set_script_config(base_url, script)
    chunk_count = put_script_code(base_url, script, upload_chunk_bytes)
    set_script_config(base_url, script)
    return {
        "role": script.role,
        "id": script.script_id,
        "name": script.name,
        "boot": script.boot,
        "bytes": script.byte_count,
        "upload_chunks": chunk_count,
    }


def write_deploy_state(base_url: str, device_version: int) -> None:
    value = json.dumps({"dv": int(device_version), "ok": 1}, separators=(",", ":"))
    rpc_call(base_url, "Text.Set", {"id": STATE_TEXT_ID, "value": value})


def delete_installer_script(base_url: str) -> bool:
    live = script_list(base_url)
    script = script_by_id(live, INSTALLER_SCRIPT_ID)
    if script is None:
        return False
    name = str(script.get("name") or "")
    if "installer" not in name.lower():
        raise DeployError(f"refusing to delete script id 1 because name is {name!r}")
    if script.get("running") is True:
        stop_script(base_url, INSTALLER_SCRIPT_ID)
    rpc_call(base_url, "Script.Delete", {"id": INSTALLER_SCRIPT_ID})
    return True


def verify_after(base_url: str, expected: list[BuiltScript], installer_deleted: bool) -> dict[str, Any]:
    live = script_list(base_url)
    seen = {}
    for script in expected:
        entry = script_by_id(live, script.script_id)
        if entry is None:
            raise DeployError(f"missing deployed script id {script.script_id} for {script.role}")
        if entry.get("name") != script.name:
            raise DeployError(f"{script.role} has wrong live name: {entry.get('name')!r}")
        if bool(entry.get("enable", False)) != script.boot:
            raise DeployError(f"{script.role} has wrong enable flag")
        seen[script.role] = {
            "id": entry.get("id"),
            "name": entry.get("name"),
            "enable": bool(entry.get("enable", False)),
            "running": bool(entry.get("running", False)),
        }
    installer = script_by_id(live, INSTALLER_SCRIPT_ID)
    if installer_deleted and installer is not None:
        raise DeployError("installer script id 1 still exists after delete")
    return {"scripts": seen, "installer_present": installer is not None}


def parse_roles(raw_roles: list[str] | None) -> set[str] | None:
    if not raw_roles:
        return None
    roles = set()
    for value in raw_roles:
        for part in str(value).split(","):
            role = part.strip()
            if role:
                roles.add(role)
    return roles or None


def command_build(args: argparse.Namespace) -> int:
    root = repo_root()
    manifest = load_manifest(root, args.manifest)
    built = build_scripts(root, manifest, parse_roles(args.role))
    for script in built:
        print(f"{script.role} id={script.script_id} name={script.name} boot={int(script.boot)} bytes={script.byte_count}")
    return 0


def command_plan(args: argparse.Namespace) -> int:
    root = repo_root()
    manifest = load_manifest(root, args.manifest)
    built = build_scripts(root, manifest, parse_roles(args.role))
    info = verify_device(args.base_url, args.expect_device_id)
    assert_expected_slots(args.base_url, built)
    result = {
        "base_url": normalize_base_url(args.base_url),
        "device_id": info.get("id"),
        "device_version": manifest["device_version"],
        "scripts": [
            {"role": s.role, "id": s.script_id, "name": s.name, "boot": s.boot, "bytes": s.byte_count}
            for s in built
        ],
        "delete_installer": bool(args.delete_installer),
    }
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


def command_deploy(args: argparse.Namespace) -> int:
    root = repo_root()
    manifest = load_manifest(root, args.manifest)
    built = build_scripts(root, manifest, parse_roles(args.role))
    info = verify_device(args.base_url, args.expect_device_id)
    assert_expected_slots(args.base_url, built)

    stop_runtime(args.base_url, include_installer=args.delete_installer)
    deployed = [deploy_one(args.base_url, script, args.upload_chunk_bytes) for script in built]
    write_deploy_state(args.base_url, manifest["device_version"])
    installer_deleted = delete_installer_script(args.base_url) if args.delete_installer else False
    if args.start_master:
        rpc_call(args.base_url, "Script.Start", {"id": MASTER_SCRIPT_ID})
        time.sleep(0.5)
    verification = verify_after(args.base_url, built, installer_deleted)
    result = {
        "base_url": normalize_base_url(args.base_url),
        "device_id": info.get("id"),
        "device_version": manifest["device_version"],
        "deployed": deployed,
        "installer_deleted": installer_deleted,
        "verification": verification,
    }
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Deploy Gen1 VVX scripts directly from the Mac via Shelly RPC.")
    parser.add_argument("--manifest", default=DEFAULT_MANIFEST)
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--expect-device-id", default=DEFAULT_DEVICE_ID)
    subparsers = parser.add_subparsers(dest="command", required=True)

    build = subparsers.add_parser("build")
    build.add_argument("--role", action="append", help="Role or comma-separated roles to build")
    build.set_defaults(func=command_build)

    plan = subparsers.add_parser("plan")
    plan.add_argument("--role", action="append", help="Role or comma-separated roles to plan")
    plan.add_argument("--delete-installer", action="store_true")
    plan.set_defaults(func=command_plan)

    deploy = subparsers.add_parser("deploy")
    deploy.add_argument("--role", action="append", help="Role or comma-separated roles to deploy")
    deploy.add_argument("--upload-chunk-bytes", type=int, default=DEFAULT_UPLOAD_CHUNK_BYTES)
    deploy.add_argument("--delete-installer", action="store_true")
    deploy.add_argument("--no-start-master", dest="start_master", action="store_false")
    deploy.set_defaults(func=command_deploy, start_master=True)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return int(args.func(args))
    except DeployError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
