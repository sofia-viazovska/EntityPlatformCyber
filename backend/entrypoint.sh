#!/bin/sh
python seed_levels.py
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
