#!/usr/bin/env python3
"""Extract every ```lean block from lessons/*.html and check it with `lake env lean`.

Every code snippet shown in a lesson must compile against core Lean (no mathlib yet).
Usage: python3 scripts/verify-lessons.py   (exit 1 if any lesson fails)
"""
import os
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PLAYGROUND = ROOT / "playground"

env = dict(os.environ)
env["PATH"] = os.path.expanduser("~/.elan/bin") + os.pathsep + env.get("PATH", "")


def main() -> int:
    lessons = sorted((ROOT / "lessons").glob("*.html"))
    if not lessons:
        print("no lessons found")
        return 1
    failures = 0
    for lesson in lessons:
        blocks = re.findall(r"```lean\n(.*?)```", lesson.read_text(), re.S)
        if not blocks:
            continue
        tmp = PLAYGROUND / f".verify-{lesson.stem}.lean"
        tmp.write_text("\n\n".join(blocks) + "\n")
        try:
            r = subprocess.run(
                ["lake", "env", "lean", tmp.name],
                cwd=PLAYGROUND, env=env, capture_output=True, text=True, timeout=300,
            )
        finally:
            tmp.unlink(missing_ok=True)
        errors = [l for l in (r.stdout + r.stderr).splitlines() if "error" in l]
        if r.returncode != 0 or errors:
            failures += 1
            print(f"FAIL {lesson.name}")
            print(r.stdout + r.stderr)
        else:
            print(f"ok   {lesson.name} ({len(blocks)} lean block(s))")
    print(f"\n{len(lessons) - failures}/{len(lessons)} lessons verified" if failures else "\nall lessons verified")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
