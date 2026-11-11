FROM python:3.12-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Install Lean 4.35.0 via elan (matches playground/lean-toolchain)
RUN curl -sSf https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh \
      | sh -s -- -y --default-toolchain leanprover/lean4:v4.35.0
ENV PATH="/root/.elan/bin:${PATH}"

WORKDIR /app
COPY runner/server.py /app/server.py
EXPOSE 8000
CMD ["python3", "server.py"]
