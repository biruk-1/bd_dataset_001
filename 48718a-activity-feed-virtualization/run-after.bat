@echo off
REM Quick script to run repository_after (Windows)

echo Starting Optimized Activity Feed (After)...
echo Location: repository_after
echo Will be available at: http://localhost:3001
echo.

cd repository_after
docker-compose up --build
