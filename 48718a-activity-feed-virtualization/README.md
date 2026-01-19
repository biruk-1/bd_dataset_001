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

### Run Before (Original Implementation)
```bash
docker compose up before
# Open http://localhost:3000
```

### Run After (Optimized Implementation)
```bash
docker compose up after
# Open http://localhost:3001
```

### Run Evaluation
```bash
docker compose run --rm evaluation
```

## Local Running (Without Docker)

### Prerequisites
- Node.js 18+ and npm

### Setup
```bash
# Install root dependencies (for evaluation)
npm install

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

**Unified tests (works for both repos):**
```bash
node tests/virtualization.test.js before
node tests/virtualization.test.js after
```

**Evaluation:**
```bash
node evaluation/evaluation.js
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
