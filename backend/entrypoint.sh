#!/bin/sh
if [ "${SEED_DEMO_DATA:-true}" = "true" ]; then
  python seed_levels.py
fi

exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --proxy-headers \
  --forwarded-allow-ips="*" \
  --workers "${WEB_CONCURRENCY:-2}"
