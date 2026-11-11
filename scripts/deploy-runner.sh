#!/bin/sh
# (Re)deploy the Lean runner backend on Koyeb from this repo's course-site branch.
# Prereqs: koyeb CLI authenticated (organization token), secret lean-course-access-code set:
#   koyeb secrets create lean-course-access-code -v "<access code>"
set -e
cd "$(dirname "$0")/.."
git push origin main:refs/heads/course-site
koyeb apps create lean-course-runner 2>/dev/null || true
koyeb service create run --app lean-course-runner \
  --git github.com/sfroment/lean-course --git-branch course-site \
  --git-builder docker --git-docker-dockerfile runner/Dockerfile \
  --port 8000:http --route /:8000 \
  --env "ACCESS_CODE={{secret.lean-course-access-code}}" --env PORT=8000 \
  --instance-type medium 2>/dev/null \
  || koyeb service update run --app lean-course-runner \
       --git github.com/sfroment/lean-course --git-branch course-site \
       --git-builder docker --git-docker-dockerfile runner/Dockerfile \
       --port 8000:http --route /:8000 \
       --env "ACCESS_CODE={{secret.lean-course-access-code}}" --env PORT=8000 \
       --instance-type medium
# NOTE: instance must be >= medium (2 GiB): Lean fails to create threads under a
# 1 GiB cgroup memory limit ("failed to create thread: Resource temporarily unavailable").
# Never set RLIMIT_AS in server.py — it hangs Lean instead.
echo "--- waiting for HEALTHY ---"
for i in $(seq 1 40); do
  sleep 15
  st=$(koyeb service get run --app lean-course-runner -o json 2>/dev/null | python3 -c "import json,sys; print(json.load(sys.stdin).get('status'))" 2>/dev/null)
  echo "[$i] status=$st"
  [ "$st" = "HEALTHY" ] && break
done
koyeb service get run --app lean-course-runner -o json | python3 -c "import json,sys; d=json.load(sys.stdin); print('domain:', d.get('domain'))"
