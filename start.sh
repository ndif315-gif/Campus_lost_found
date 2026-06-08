#!/bin/bash

# Start both backend and frontend services
# Backend runs on port 5000
# Frontend runs on port 3000

echo "🚀 Starting Campus Lost & Found Application"
echo "==========================================="
echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "🔵 Backend: http://localhost:5000"
echo "🟢 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

npm start
