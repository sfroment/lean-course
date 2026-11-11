#!/usr/bin/env python3
"""Tiny Lean-execution backend for the course site.

POST /run  {"code": "..."}  with header X-Access-Code: <access code>
  -> runs `lean` on the code (core Lean only, no mathlib) in a temp dir
     with CPU/memory/timeout limits, returns {"rc": int, "output": str}
GET /health -> {"ok": true}

CORS is restricted to the course site origin. The access code is the same
single password as the site gate (kept server-side via Koyeb secret).
"""
import json
import os
import resource
import subprocess
import tempfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ACCESS_CODE = os.environ.get("ACCESS_CODE", "")
PORT = int(os.environ.get("PORT", "8000"))
ORIGIN = os.environ.get("ALLOWED_ORIGIN", "https://sfroment.github.io")
MAX_BODY = 64 * 1024
TIMEOUT_S = 30


def limits():
    # RLIMIT_AS must be generous: Lean reserves large virtual arenas and hangs
    # if mmap starts failing (1 GiB is NOT enough). This caps virtual, not
    # resident, memory — RSS stays small for course-sized files.
    resource.setrlimit(resource.RLIMIT_AS, (6 << 30, 6 << 30))   # 6 GiB address space
    resource.setrlimit(resource.RLIMIT_CPU, (20, 20))           # 20 s CPU


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", ORIGIN)
        self.send_header("Access-Control-Allow-Headers", "content-type, x-access-code")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def _json(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self._cors()
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self._json(200, {"ok": True})
        else:
            self._json(404, {"error": "not found"})

    def do_POST(self):
        if self.path != "/run":
            self._json(404, {"error": "not found"})
            return
        if not ACCESS_CODE or self.headers.get("x-access-code") != ACCESS_CODE:
            self._json(401, {"error": "unauthorized"})
            return
        n = int(self.headers.get("content-length") or 0)
        if n <= 0 or n > MAX_BODY:
            self._json(413, {"error": "body too large"})
            return
        try:
            code = json.loads(self.rfile.read(n)).get("code", "")
        except Exception:
            self._json(400, {"error": "bad json"})
            return
        if not isinstance(code, str) or len(code) > MAX_BODY:
            self._json(400, {"error": "bad code"})
            return
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, "scratch.lean")
            with open(path, "w") as f:
                f.write(code)
            try:
                r = subprocess.run(
                    ["lean", path], cwd=d, capture_output=True, text=True,
                    timeout=TIMEOUT_S, preexec_fn=limits,
                )
                rc, out = r.returncode, (r.stdout + r.stderr).strip()
            except subprocess.TimeoutExpired:
                rc, out = 124, f"error: timeout after {TIMEOUT_S}s"
        self._json(200, {"rc": rc, "output": out})

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
