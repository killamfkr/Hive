#!/bin/sh
set -e

# Default SQLite path inside the container (mount a host folder to /data on Unraid)
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/data/forum.db"
fi

echo "Running database migrations..."
./node_modules/.bin/prisma migrate deploy

exec node server.js
