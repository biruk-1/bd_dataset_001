# Activity Feed Virtualization

## Problem Statement

The current Activity Feed renders every activity item into the DOM, regardless of whether it is visible in the viewport. As activity volume grows, this approach causes:

- Severe performance degradation
- Poor scrolling experience
- Excessive memory consumption
- Long initial render times

This makes the application unusable for large enterprise teams generating 10,000+ daily activity events.

## Solution

Implemented virtual scrolling (windowed virtualization) that only renders visible items plus a small buffer zone, reducing DOM nodes from thousands to ~15-20 while maintaining 60 FPS.

## Docker Commands

### Build Docker Image
```bash
docker compose build
```

### Before Test Command
```bash
docker compose run --rm -e PYTHONPATH=/app app pytest tests/test_repository_before.py -v
```

### After Test Command
```bash
docker compose run --rm -e PYTHONPATH=/app app pytest tests/test_repository_after.py -v
```

### Test & Report Command
```bash
docker compose run --rm -e PYTHONPATH=/app app python evaluation/evaluation.py
```

## Local Running (Without Docker)

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+ and pip

### Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install dependencies for repository_before
cd repository_before/activity-feed-virtualization
npm install
cd ../..

# Install dependencies for repository_after
cd repository_after
npm install
cd ..
```

### Run Tests Locally

**Before tests:**
```bash
pytest tests/test_repository_before.py -v
```

**After tests:**
```bash
pytest tests/test_repository_after.py -v
```

**Evaluation:**
```bash
python evaluation/evaluation.py
```

### Run Applications Locally

**Before (original):**
```bash
cd repository_before/activity-feed-virtualization
npm start
# Open http://localhost:3000
```

**After (optimized):**
```bash
cd repository_after
npm start
# Open http://localhost:3000
```
