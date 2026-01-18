#!/bin/bash
# Quick script to run repository_after

echo "🚀 Starting Optimized Activity Feed (After)..."
echo "📍 Location: repository_after"
echo "🌐 Will be available at: http://localhost:3001"
echo ""

cd repository_after
docker-compose up --build
