#!/bin/sh
set -e

echo "Running database migrations..."
flask db upgrade

echo "Starting Gunicorn..."
exec gunicorn run:app --bind 0.0.0.0:${PORT:-10000}