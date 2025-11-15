#!/bin/bash

echo "🚀 PHCS Hackathon Setup"
echo "======================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd backend
npm install
echo "✅ Backend ready!"
echo ""

# Frontend setup
echo "📦 Setting up Frontend..."
cd ../frontend
npm install
echo "✅ Frontend ready!"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "📝 Quick Start:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "🌐 Open http://localhost:3000"
echo "📧 Demo: demo@jhs.org / demo123"
echo ""
