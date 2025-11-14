#!/bin/bash

# Backend Setup Script for Personal Website v2
# This script sets up the Python environment and installs all dependencies

set -e  # Exit on error

echo "=========================================="
echo "Personal Website v2 - Backend Setup"
echo "=========================================="
echo ""

# Check Python version
echo "✓ Checking Python version..."
python3 --version || { echo "ERROR: Python 3 not found"; exit 1; }

# Navigate to backend directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
cd "$BACKEND_DIR"

echo "✓ Working directory: $BACKEND_DIR"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip --quiet
echo "✓ pip upgraded"
echo ""

# Install dependencies
echo "Installing Python dependencies..."
echo "This may take a few minutes..."
pip install -r requirements.txt --quiet
echo "✓ All dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file to configure:"
    echo "   - OLLAMA_BASE_URL (your Ollama server URL)"
    echo "   - REDIS_URL (if using rate limiting)"
else
    echo "✓ .env file already exists"
fi
echo ""

# Test imports
echo "Testing backend imports..."
python -c "from main import app; print('✓ FastAPI app loads successfully')" 2>&1 | grep -v "warning" || true
echo ""

echo "=========================================="
echo "Backend Setup Complete! ✅"
echo "=========================================="
echo ""
echo "To start the backend server:"
echo "  1. cd $(pwd)"
echo "  2. source venv/bin/activate"
echo "  3. uvicorn main:app --reload"
echo ""
echo "The API will be available at: http://localhost:8000"
echo "API docs will be at: http://localhost:8000/docs"
echo ""
