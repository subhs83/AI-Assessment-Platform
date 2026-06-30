#!/bin/sh
set -e

echo "Running database migrations..."
flask db upgrade

echo "Starting Gunicorn..."
exec gunicorn --bind 0.0.0.0:${PORT:-10000} --workers 1 --threads 2 --timeout 180 --graceful-timeout 30 run:app