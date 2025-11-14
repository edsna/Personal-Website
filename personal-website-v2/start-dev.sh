#!/bin/bash

# Start Development Servers for Personal Website v2
# This script starts both backend and frontend in separate terminals

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "Starting Personal Website v2"
echo "=========================================="
echo ""

# Check if setup has been run
if [ ! -d "$SCRIPT_DIR/backend/venv" ]; then
    echo "⚠️  Backend not set up. Running setup..."
    bash "$SCRIPT_DIR/setup-backend.sh"
fi

if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    echo "⚠️  Frontend not set up. Running setup..."
    bash "$SCRIPT_DIR/setup-frontend.sh"
fi

echo ""
echo "Starting servers..."
echo ""
echo "Backend API will be at: http://localhost:8000"
echo "Frontend will be at: http://localhost:3000"
echo ""
echo "⚠️  You need to run these in separate terminals:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd $SCRIPT_DIR/backend"
echo "  source venv/bin/activate"
echo "  uvicorn main:app --reload"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd $SCRIPT_DIR/frontend"
echo "  npm run dev"
echo ""
echo "Or use tmux/screen to run both simultaneously"
echo ""
