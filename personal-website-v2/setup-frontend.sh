#!/bin/bash

# Frontend Setup Script for Personal Website v2
# This script sets up Node.js environment and installs all dependencies

set -e  # Exit on error

echo "=========================================="
echo "Personal Website v2 - Frontend Setup"
echo "=========================================="
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
node --version || { echo "ERROR: Node.js not found"; exit 1; }
npm --version || { echo "ERROR: npm not found"; exit 1; }

# Navigate to frontend directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
cd "$FRONTEND_DIR"

echo "✓ Working directory: $FRONTEND_DIR"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file from example..."
    cp .env.example .env.local
    echo "✓ .env.local file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local to configure:"
    echo "   - NEXT_PUBLIC_API_URL (backend API URL)"
    echo "   - NEXT_PUBLIC_CALENDAR_LINK (your Calendly link)"
else
    echo "✓ .env.local file already exists"
fi
echo ""

# Install dependencies
echo "Installing Node.js dependencies..."
echo "This may take a few minutes..."
npm install
echo "✓ All dependencies installed"
echo ""

# Build to verify everything works
echo "Testing production build..."
npm run build
echo "✓ Build successful"
echo ""

echo "=========================================="
echo "Frontend Setup Complete! ✅"
echo "=========================================="
echo ""
echo "To start the frontend development server:"
echo "  1. cd $(pwd)"
echo "  2. npm run dev"
echo ""
echo "The website will be available at: http://localhost:3000"
echo ""
