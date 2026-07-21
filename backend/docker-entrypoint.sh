#!/bin/sh
set -e

mkdir -p /app/uploads
if [ -d /app/default_uploads ]; then
    cp -Rn /app/default_uploads/. /app/uploads/
fi

exec "$@"
