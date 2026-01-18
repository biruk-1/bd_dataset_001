@echo off
REM Quick script to run repository_before (Windows)

echo Starting Original Activity Feed (Before)...
echo Location: repository_before/activity-feed-virtualization
echo Will be available at: http://localhost:3000
echo.

cd repository_before\activity-feed-virtualization
docker-compose up --build
