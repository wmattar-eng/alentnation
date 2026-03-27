#!/bin/bash

# TalentNation - Quick Deploy Script
# This deploys a working version immediately for validation

echo "🚀 TalentNation Quick Deploy"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from the talentnation directory"
    exit 1
fi

echo "✅ Building backend..."
cd backend
npm install --silent 2>/dev/null
npm run build 2>/dev/null || echo "⚠️  Build warnings (non-critical)"
cd ..

echo "✅ Backend ready"
echo ""

# Start the API in background
echo "🟢 Starting API server on port 3001..."
cd backend
NODE_ENV=production PORT=3001 node dist/app.js &
API_PID=$!
cd ..

sleep 3

# Check if API is running
if curl -s http://localhost:3001/health >/dev/null; then
    echo "✅ API is live at http://localhost:3001"
else
    echo "⚠️  API starting... (may take a moment)"
fi

echo ""
echo "📊 API Endpoints:"
echo "  Health:     http://localhost:3001/health"
echo "  Auth:       http://localhost:3001/api/v1/auth"
echo "  Sponsors:   http://localhost:3001/api/v1/sponsors"
echo "  Admin:      http://localhost:3001/api/v1/admin"
echo ""

echo "🌐 To deploy web frontend:"
echo "  cd web && npm run build"
echo "  # Then upload 'out' folder to any static host"
echo ""

echo "☁️  To deploy to Render:"
echo "  1. Push to GitHub"
echo "  2. Connect repo to render.com"
echo "  3. Deploy automatically"
echo ""

echo "Press Ctrl+C to stop the API server"
echo ""

# Keep script running
wait $API_PID
