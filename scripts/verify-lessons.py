#!/usr/bin/env python3
"""Machine-check every code block in lessons/*.html with `lake env lean`.

- <pre><code> blocks            -> must compile with ZERO errors (solutions, examples)
- <pre data-exercise><code>     -> must compile with zero errors; `sorry` warnings allowed
                                     (exercise statements with holes to fill)

Usage: python3 scripts/verify-lessons.py   (exit 1 if any block fails)
"""
import html
import os
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PLAYGROUND = ROOT / "playground"

env = dict(os.environ)
env["PATH"] = os.path.expanduser("~/.elan/bin") + os.pathsep + env.get("PATH", "")

PRE_RE = re.compile(r'<pre([^>]*)><code>(.*?)</code></pre>', re.S)


def blocks_of(lesson: pathlib.Path):
    """Yield (is_exercise, code) for each pre/code block in the lesson."""
    for attrs, body in PRE_RE.findall(lesson.read_text()):
        if 'data-lang="sh"' in attrs or 'data-lang="shell"' in attrs:
            continue  # shell snippets, not Lean
        code = html.unescape(body).strip("\n")
        yield ("data-exercise" in attrs, code)


def main() -> int:
    lessons = sorted((ROOT / "lessons").glob("*.html"))
    if not lessons:
        print("no lessons found")
        return 1
    failures = 0
    checked = 0
    for lesson in lessons:
        blocks = list(blocks_of(lesson))
        if not blocks:
            continue
        # each block checked in isolation so one failure doesn't mask others
        for i, (is_ex, code) in enumerate(blocks):
            checked += 1
            tmp = PLAYGROUND / f".verify-{lesson.stem}-{i}.lean"
            tmp.write_text(code + "\n")
            try:
                r = subprocess.run(
                    ["lake", "env", "lean", tmp.name],
                    cwd=PLAYGROUND, env=env, capture_output=True, text=True, timeout=300,
                )
            finally:
                tmp.unlink(missing_ok=True)
            out = r.stdout + r.stderr
            errors = [l for l in out.splitlines() if re.search(r"\berror\b", l)]
            if r.returncode != 0 or errors:
                failures += 1
                kind = "exercise" if is_ex else "code"
                print(f"FAIL {lesson.name} [{kind} #{i}]")
                print(out)
    print(f"\n{checked - failures}/{checked} blocks verified" if failures else f"\nall {checked} blocks verified")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
