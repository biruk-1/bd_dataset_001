@echo off
REM Quick script to run both repositories (Windows)

echo Starting Both Activity Feeds...
echo Original (Before): http://localhost:3000
echo Optimized (After): http://localhost:3001
echo.
echo Press Ctrl+C to stop both
echo.

docker-compose up --build
