#!/usr/bin/env python3
"""Read-only publication preflight: 0 publish, 10 skip, 20 blocked.

Use a fresh, single-commit snapshot of main. This checks consistency, not a lock.
"""

import argparse
from datetime import date, datetime, time, timedelta
import json
from pathlib import Path
from zoneinfo import ZoneInfo

TOKYO = ZoneInfo("Asia/Tokyo")


def scheduled_week(now=None):
    now = (now or datetime.now(TOKYO)).astimezone(TOKYO)
    friday = now.date() - timedelta(days=(now.weekday() - 4) % 7)
    if now < datetime.combine(friday, time(8), TOKYO):
        friday -= timedelta(days=7)
    return friday


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def issue_errors(root, week, entries):
    errors = []
    markdown = root / "weekly" / f"{week}.md"
    data_path = root / "weekly" / f"{week}.json"
    data = None
    if not markdown.is_file() or not markdown.read_text(encoding="utf-8").strip():
        errors.append(f"Missing or empty weekly/{week}.md")
    if not data_path.is_file():
        errors.append(f"Missing weekly/{week}.json")
    else:
        data = read_json(data_path)
        if not isinstance(data, dict) or data.get("week") != week:
            errors.append(f"weekly/{week}.json has a mismatched week")
        elif not isinstance(data.get("papers"), list) or not data["papers"]:
            errors.append(f"weekly/{week}.json has no paper list")
    if len(entries) != 1:
        errors.append(f"Expected one archive entry for {week}, found {len(entries)}")
    else:
        entry = entries[0]
        for key, value in {
            "file": f"weekly/view.html?week={week}",
            "source_file": f"weekly/{week}.md",
            "data_file": f"weekly/{week}.json",
        }.items():
            if entry.get(key) != value:
                errors.append(f"Archive {key} does not point to {week}")
        if isinstance(data, dict) and isinstance(data.get("papers"), list):
            if entry.get("total") != len(data["papers"]):
                errors.append(f"Archive total does not match {week}")
    return data, errors


def inspect(root, week):
    """Inspect one canonical date without reading the network or writing files."""
    root = Path(root)
    try:
        target = date.fromisoformat(week)
        if target.isoformat() != week:
            raise ValueError("Issue date must use YYYY-MM-DD")
        if target.weekday() != 4:
            raise ValueError("Scheduled issues must use their Friday date")
        archive = read_json(root / "data/archive.json")
        current = read_json(root / "data/current.json")
        if not isinstance(archive, list) or not all(isinstance(x, dict) for x in archive):
            raise ValueError("Archive must be a list of objects")
        if not isinstance(current, dict):
            raise ValueError("Current issue must be an object")
        current_week = current.get("week")
        current_date = date.fromisoformat(current_week)
        weeks = [x.get("week") for x in archive]
        if not all(isinstance(x, str) for x in weeks) or len(weeks) != len(set(weeks)):
            raise ValueError("Archive has missing or duplicate week keys")
        if not weeks or weeks[0] != current_week or max(map(date.fromisoformat, weeks)) != current_date:
            raise ValueError("Archive and current issue disagree about the latest week")
        baseline, errors = issue_errors(root, current_week, [x for x in archive if x.get("week") == current_week])
        if baseline != current:
            errors.append("data/current.json differs from its matching weekly JSON")
        entries = [x for x in archive if x.get("week") == week]
        exists = bool(entries) or any((root / "weekly" / f"{week}.{ext}").exists() for ext in ("md", "json"))
        if exists:
            _, target_errors = issue_errors(root, week, entries)
            errors.extend(target_errors)
            if current_date < target:
                errors.append("Requested issue files exist but current issue was not advanced")
            if errors:
                return {"decision": "blocked", "week": week, "reasons": errors}
            return {"decision": "skip", "week": week, "reason": "Issue is already fully published; leave content unchanged"}
        if current_date >= target:
            errors.append("Refusing to publish a missing issue at or before the current issue")
        if errors:
            return {"decision": "blocked", "week": week, "reasons": errors}
        return {"decision": "publish", "week": week, "reason": "Issue is absent and the previous publication is consistent"}
    except (OSError, ValueError, TypeError, KeyError) as exc:
        return {"decision": "blocked", "week": week, "reasons": [str(exc)]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--week", help="Original Friday issue date for a delayed/retried run")
    args = parser.parse_args()
    due = scheduled_week()
    week = args.week or due.isoformat()
    try:
        future = date.fromisoformat(week) > due
    except ValueError:
        future = False
    if future:
        result = {"decision": "blocked", "week": week, "reasons": [f"Latest due issue is {due}; do not publish a future issue"]}
    else:
        result = inspect(args.root, week)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return {"publish": 0, "skip": 10, "blocked": 20}[result["decision"]]


if __name__ == "__main__":
    raise SystemExit(main())
