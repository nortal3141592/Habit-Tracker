#!/usr/bin/env bash
#
# Starts the backend (FastAPI, via uv) and frontend (Vite) together.
# Run this from the repo root: ./dev.sh
#
# Ctrl+C stops both processes cleanly.

set -e

FRONTEND_DIR="habit-tracker-frontend"

BACKEND_CMD="uv run fastapi dev app/main.py"

echo "Starting backend..."
$BACKEND_CMD &
BACKEND_PID=$!

echo "Starting frontend..."
(cd "$FRONTEND_DIR" && npm run dev) &
FRONTEND_PID=$!

# Kill both child processes when this script exits (Ctrl+C, error, etc.)
cleanup() {
    echo ""
    echo "Shutting down..."
    kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
    wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
    echo "Done."
}
trap cleanup EXIT INT TERM

# Wait on both — script stays alive until you Ctrl+C, or either process dies
wait
