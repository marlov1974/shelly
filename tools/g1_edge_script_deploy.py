#!/usr/bin/env python3
"""Deploy one standalone Shelly script to a Gen1 edge device."""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


DEFAULT_UPLOAD_CHUNK_BYTES = 1500
DEFAULT_TIMEOUT_SECONDS = 5.0


class DeployError(Exception):
    """Raised when edge script deploy cannot safely continue."""


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


def verify_device(base_url: str, expected_id_suffix: str) -> dict[str, Any]:
    info = rpc_call(base_url, "Shelly.GetDeviceInfo")
    if not isinstance(info, dict):
        raise DeployError("Shelly.GetDeviceInfo returned non-object result")
    if expected_id_suffix:
        live = normalized_id(info.get("id") or info.get("mac"))
        wanted = normalized_id(expected_id_suffix)
        if not live.endswith(wanted):
            raise DeployError(f"target mismatch: expected {expected_id_suffix}, got {info.get('id')!r}")
    return info


def script_list(base_url: str) -> list[dict[str, Any]]:
    result = rpc_call(base_url, "Script.List")
    scripts = result.get("scripts") if isinstance(result, dict) else result
    if not isinstance(scripts, list):
        raise DeployError("Script.List returned no scripts list")
    return [script for script in scripts if isinstance(script, dict)]


def find_script_id(base_url: str, name: str) -> int:
    for script in script_list(base_url):
        if script.get("name") == name:
            script_id = script.get("id")
            if isinstance(script_id, int):
                return script_id
    result = rpc_call(base_url, "Script.Create", {"name": name})
    script_id = result.get("id") if isinstance(result, dict) else None
    if not isinstance(script_id, int):
        raise DeployError("Script.Create did not return a numeric id")
    return script_id


def get_script_by_id(base_url: str, script_id: int) -> dict[str, Any]:
    for script in script_list(base_url):
        if script.get("id") == script_id:
            return script
    raise DeployError(f"script id {script_id} does not exist")


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


def stop_script(base_url: str, script_id: int) -> None:
    try:
        rpc_call(base_url, "Script.Stop", {"id": script_id})
    except DeployError as exc:
        if "not found" not in str(exc).lower():
            raise
    time.sleep(0.08)


def put_script_code(base_url: str, script_id: int, code: str, upload_chunk_bytes: int) -> int:
    chunks = split_upload_chunks(code, upload_chunk_bytes)
    for index, chunk in enumerate(chunks):
        rpc_call(base_url, "Script.PutCode", {"id": script_id, "code": chunk, "append": index > 0})
        time.sleep(0.12)
    return len(chunks)


def command_deploy(args: argparse.Namespace) -> int:
    script_path = Path(args.script).resolve()
    if not script_path.is_file():
        raise DeployError(f"missing script file: {script_path}")
    code = script_path.read_text(encoding="utf-8")
    info = verify_device(args.base_url, args.expect_device_id)
    if args.script_id is not None:
        script_id = int(args.script_id)
        get_script_by_id(args.base_url, script_id)
    else:
        script_id = find_script_id(args.base_url, args.name)
    stop_script(args.base_url, script_id)
    rpc_call(args.base_url, "Script.SetConfig", {"id": script_id, "config": {"name": args.name, "enable": bool(args.enable)}})
    chunk_count = put_script_code(args.base_url, script_id, code, args.upload_chunk_bytes)
    rpc_call(args.base_url, "Script.SetConfig", {"id": script_id, "config": {"name": args.name, "enable": bool(args.enable)}})
    if args.start:
        rpc_call(args.base_url, "Script.Start", {"id": script_id})
        time.sleep(0.5)
    live = script_list(args.base_url)
    final = None
    for script in live:
        if script.get("id") == script_id:
            final = script
            break
    print(json.dumps({
        "base_url": normalize_base_url(args.base_url),
        "device_id": info.get("id"),
        "script": {
            "id": script_id,
            "name": args.name,
            "enable": bool(args.enable),
            "start_requested": bool(args.start),
            "bytes": len(code.encode("utf-8")),
            "upload_chunks": chunk_count,
            "live": final,
        },
    }, indent=2, sort_keys=True))
    return 0



def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Deploy one Gen1 edge Shelly script via RPC.")
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--expect-device-id", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--script", required=True)
    parser.add_argument("--script-id", type=int, default=None, help="Reuse an existing script id instead of creating/finding by name.")
    parser.add_argument("--upload-chunk-bytes", type=int, default=DEFAULT_UPLOAD_CHUNK_BYTES)
    parser.add_argument("--enable", action="store_true")
    parser.add_argument("--start", action="store_true")
    parser.set_defaults(func=command_deploy)
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
