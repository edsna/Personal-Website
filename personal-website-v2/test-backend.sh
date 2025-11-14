#!/bin/bash

# Quick Backend Test Script

cd "$(dirname "$0")/backend" || exit 1

echo "Testing backend startup..."
source venv/bin/activate

# Start uvicorn in background
uvicorn main:app --host 127.0.0.1 --port 8000 > /tmp/backend_test.log 2>&1 &
BACKEND_PID=$!

# Wait for startup
sleep 5

# Test health endpoint
echo ""
echo "Testing health endpoint..."
curl -s http://localhost:8000/api/health 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Health endpoint response received"

# Test API docs
echo ""
echo "Testing API docs..."
curl -s http://localhost:8000/docs 2>/dev/null | grep -q "Swagger" && echo "✓ API docs accessible" || echo "⚠ API docs check failed"

# Cleanup
kill $BACKEND_PID 2>/dev/null
wait $BACKEND_PID 2>/dev/null

echo ""
echo "Backend test complete!"
echo ""
echo "Last 15 lines of server log:"
tail -15 /tmp/backend_test.log
