#!/usr/bin/env python3
"""Set the access code for the site gate.

Writes SHA-256(SALT + code) into assets/gate.js (the page only ever stores and
compares hashes — the code itself is never in the repo).

Usage:
  python3 scripts/set-gate-code.py "your code"   # set a specific code
  python3 scripts/set-gate-code.py               # generate + print a random one
"""
import hashlib
import pathlib
import re
import secrets
import string
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SALT = "lean-course-gate-v1"  # keep in sync with assets/gate.js

if len(sys.argv) > 1:
    code = sys.argv[1]
else:
    alphabet = string.ascii_letters + string.digits + "-_"
    code = "".join(secrets.choice(alphabet) for _ in range(24))

digest = hashlib.sha256((SALT + code).encode()).hexdigest()

path = ROOT / "assets" / "gate.js"
src = path.read_text()
if not re.search(r'var EXPECTED = "[^"]*";', src):
    sys.exit("error: EXPECTED line not found in assets/gate.js")
path.write_text(re.sub(r'var EXPECTED = "[^"]*";', f'var EXPECTED = "{digest}";', src))

print(f"access code : {code}")
print(f"sha256 stored: {digest}")
print("share the code only with people you want in; rotate anytime by re-running this script")
