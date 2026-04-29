#!/usr/bin/env python3
"""Apply a ChatGPT YAML change plan.

Supported actions:
  - write: write/replace a UTF-8 file
  - move: move a file using git mv
  - delete: delete a file using git rm

Run from repository root.

Examples:
  python tools/apply_chatgpt_plan.py --plan tools/chatgpt-driver-v1.yaml --dry-run
  python tools/apply_chatgpt_plan.py --plan tools/chatgpt-driver-v1.yaml
  python tools/apply_chatgpt_plan.py --plan tools/move_to_old.yaml --allow-missing
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:  # pragma: no cover
    raise SystemExit("Missing dependency: pyyaml\nInstall with: python -m pip install pyyaml")


def run(cmd: list[str], dry_run: bool) -> None:
    print("+ " + " ".join(cmd))
    if not dry_run:
        subprocess.run(cmd, check=True)


def check_repo_root() -> None:
    if not Path(".git").exists():
        raise SystemExit("Run this script from the repository root; .git was not found.")


def load_plan(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    if not isinstance(data, dict):
        raise SystemExit("Plan root must be a YAML object.")
    return data


def write_file(item: dict[str, Any], dry_run: bool) -> None:
    path = Path(str(item["path"]))
    content = str(item.get("content", ""))
    reason = str(item.get("reason", "")).strip()

    print(f"\nWrite: {path}")
    if reason:
        print(f"Reason: {reason}")
    if dry_run:
        print(f"+ mkdir -p {path.parent}")
        print(f"+ write {len(content)} chars")
        return

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def move_file(item: dict[str, Any], dry_run: bool, allow_missing: bool) -> None:
    src = Path(str(item["from"]))
    dst = Path(str(item["to"]))
    reason = str(item.get("reason", "")).strip()

    if not src.exists():
        msg = f"Missing source: {src}"
        if allow_missing:
            print("SKIP " + msg)
            return
        raise SystemExit(msg)

    if dst.exists():
        raise SystemExit(f"Destination already exists: {dst}")

    print(f"\nMove: {src} -> {dst}")
    if reason:
        print(f"Reason: {reason}")
    if not dry_run:
        dst.parent.mkdir(parents=True, exist_ok=True)
    else:
        print(f"+ mkdir -p {dst.parent}")
    run(["git", "mv", str(src), str(dst)], dry_run=dry_run)


def delete_file(item: dict[str, Any], dry_run: bool, allow_missing: bool) -> None:
    path = Path(str(item["path"]))
    reason = str(item.get("reason", "")).strip()

    if not path.exists():
        msg = f"Missing source: {path}"
        if allow_missing:
            print("SKIP " + msg)
            return
        raise SystemExit(msg)

    print(f"\nDelete: {path}")
    if reason:
        print(f"Reason: {reason}")
    run(["git", "rm", str(path)], dry_run=dry_run)


def apply_action(item: dict[str, Any], dry_run: bool, allow_missing: bool) -> None:
    action = str(item.get("action", "")).strip().lower()

    # Backward compatibility with the older move_to_old.yaml format.
    if not action and "from" in item and "to" in item:
        action = "move"

    if action == "write":
        if "path" not in item:
            raise SystemExit(f"write action missing path: {item}")
        write_file(item, dry_run=dry_run)
        return

    if action == "move":
        if "from" not in item or "to" not in item:
            raise SystemExit(f"move action missing from/to: {item}")
        move_file(item, dry_run=dry_run, allow_missing=allow_missing)
        return

    if action == "delete":
        if "path" not in item:
            raise SystemExit(f"delete action missing path: {item}")
        delete_file(item, dry_run=dry_run, allow_missing=allow_missing)
        return

    raise SystemExit(f"Unsupported action: {action!r} in {item}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Apply a ChatGPT YAML change plan.")
    parser.add_argument("--plan", required=True, help="Path to YAML plan.")
    parser.add_argument("--dry-run", action="store_true", help="Print operations without changing files.")
    parser.add_argument("--allow-missing", action="store_true", help="Skip missing files for move/delete actions.")
    args = parser.parse_args()

    check_repo_root()
    plan = load_plan(Path(args.plan))

    actions = plan.get("actions")
    if actions is None:
        actions = plan.get("moves")
    if not isinstance(actions, list) or not actions:
        raise SystemExit("No actions/moves found in plan.")

    print(f"Plan: {args.plan}")
    print(f"Actions: {len(actions)}")
    if "description" in plan:
        print("Description: " + str(plan["description"]))
    if args.dry_run:
        print("Mode: dry-run")

    for raw in actions:
        if not isinstance(raw, dict):
            raise SystemExit(f"Invalid action item: {raw}")
        apply_action(raw, dry_run=args.dry_run, allow_missing=args.allow_missing)

    print("\nDone.")
    print("Next:")
    print("  git status")
    print("  git diff --stat")
    print("  git commit -m \"<message>\"")
    print("  git push")
    return 0


if __name__ == "__main__":
    sys.exit(main())
