# runner/

The Lean-execution backend behind the site's **▶ Run** button.

- `server.py` — stdlib HTTP server: `POST /run` (header `X-Access-Code`, JSON
  body `{"code": ...}`) runs `lean` on the code with CPU/memory/timeout limits
  and returns `{"rc", "output"}`. `GET /health`. CORS restricted to the site.
- `Dockerfile` — python:3.12-slim + Lean 4.35.0 via elan (same toolchain as `playground/`).

Deployed on Koyeb, built from this repo (`course-site` branch) with
`--git-builder docker --git-dockerfile runner/Dockerfile`. The access code is a
Koyeb secret (`lean-course-access-code`), passed as env `ACCESS_CODE={{secret.lean-course-access-code}}`.
Redeploy with `scripts/deploy-runner.sh`.
