#!/usr/bin/env python3
"""Move obsolete files to old folders using git mv.

Run from the repository root.

Examples:
  python tools/move_to_old.py --plan tools/move_to_old.yaml --dry-run
  python tools/move_to_old.py --plan tools/move_to_old.yaml
  python tools/move_to_old.py --plan tools/move_to_old.yaml --allow-missing
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
    raise SystemExit(
        "Missing dependency: pyyaml\n"
        "Install with: python -m pip install pyyaml"
    )


def run(cmd: list[str], dry_run: bool) -> None:
    print("+ " + " ".join(cmd))
    if not dry_run:
        subprocess.run(cmd, check=True)


def load_plan(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    if not isinstance(data, dict):
        raise SystemExit("Plan root must be a YAML object.")
    return data


def check_repo_root() -> None:
    if not Path(".git").exists():
        raise SystemExit("Run this script from the repository root; .git was not found.")


def move_one(item: dict[str, Any], dry_run: bool, allow_missing: bool) -> None:
    if "from" not in item or "to" not in item:
        raise SystemExit(f"Invalid move item, expected from/to: {item}")

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


def main() -> int:
    parser = argparse.ArgumentParser(description="Move files according to a YAML plan using git mv.")
    parser.add_argument("--plan", required=True, help="Path to YAML move plan.")
    parser.add_argument("--dry-run", action="store_true", help="Print operations without changing files.")
    parser.add_argument("--allow-missing", action="store_true", help="Skip missing source files instead of failing.")
    args = parser.parse_args()

    check_repo_root()
    plan = load_plan(Path(args.plan))
    moves = plan.get("moves", [])
    if not isinstance(moves, list) or not moves:
        raise SystemExit("No moves found in plan.")

    print(f"Plan: {args.plan}")
    print(f"Moves: {len(moves)}")
    if args.dry_run:
        print("Mode: dry-run")

    for raw in moves:
        if not isinstance(raw, dict):
            raise SystemExit(f"Invalid move item: {raw}")
        move_one(raw, dry_run=args.dry_run, allow_missing=args.allow_missing)

    print("\nDone.")
    print("Next:")
    print("  git status")
    print("  git diff --stat")
    print("  git commit -m \"Move obsolete files to old\"")
    print("  git push")
    return 0


if __name__ == "__main__":
    sys.exit(main())
