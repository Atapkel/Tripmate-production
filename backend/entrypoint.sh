#!/bin/sh
set -e

. /app/.venv/bin/activate

echo "Running database migrations..."
alembic upgrade head

echo "Seeding default data..."
python populate_db.py

echo "Starting application..."
exec "$@"
