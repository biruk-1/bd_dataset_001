# 📋 Complete Commands Reference

## 🎯 One-Line Commands (Copy & Paste)

### Run Both Repositories
```bash
docker-compose up --build
```
**Result**: 
- Before at http://localhost:3000
- After at http://localhost:3001

### Run Only Original (Before)
```bash
cd repository_before/activity-feed-virtualization && docker-compose up --build
```

### Run Only Optimized (After)
```bash
cd repository_after && docker-compose up --build
```

### Stop All Containers
```bash
docker-compose down
```

### Run Tests
```bash
cd repository_after && docker build -f Dockerfile.test -t test . && docker run --rm test
```

---

## 📦 Detailed Commands

### Repository Before (Original)

#### Start
```bash
cd repository_before/activity-feed-virtualization
docker-compose up --build
```

#### Stop
```bash
docker-compose down
```

#### Rebuild
```bash
docker-compose build --no-cache
docker-compose up
```

#### View Logs
```bash
docker-compose logs -f
```

#### Run Tests
```bash
docker build -f Dockerfile.test -t before-test .
docker run --rm before-test
```

---

### Repository After (Optimized)

#### Start
```bash
cd repository_after
docker-compose up --build
```

#### Stop
```bash
docker-compose down
```

#### Rebuild
```bash
docker-compose build --no-cache
docker-compose up
```

#### View Logs
```bash
docker-compose logs -f
```

#### Run Tests
```bash
docker build -f Dockerfile.test -t after-test .
docker run --rm after-test
```

#### Run Tests with Coverage
```bash
docker build -f Dockerfile.test -t after-test .
docker run --rm after-test npm test -- --coverage --watchAll=false
```

---

### Both Repositories Together

#### Start Both
```bash
# From root directory
docker-compose up --build
```

#### Stop Both
```bash
docker-compose down
```

#### View Logs for Both
```bash
docker-compose logs -f
```

#### View Logs for Specific Service
```bash
docker-compose logs -f before
docker-compose logs -f after
```

#### Rebuild Both
```bash
docker-compose build --no-cache
docker-compose up
```

---

## 🔧 Docker Management Commands

### List Running Containers
```bash
docker ps
```

### List All Containers (Including Stopped)
```bash
docker ps -a
```

### View Container Logs
```bash
docker logs activity-feed-before
docker logs activity-feed-after
```

### Execute Commands in Container
```bash
# Open shell
docker exec -it activity-feed-after sh

# Run npm command
docker exec -it activity-feed-after npm test
```

### Stop Specific Container
```bash
docker stop activity-feed-before
docker stop activity-feed-after
```

### Remove Container
```bash
docker rm activity-feed-before
docker rm activity-feed-after
```

### Remove Image
```bash
docker rmi activity-feed-before
docker rmi activity-feed-after
```

### Clean Up Everything
```bash
# Stop and remove containers
docker-compose down

# Remove volumes too
docker-compose down -v

# Remove all unused resources
docker system prune -a
```

---

## 🧪 Testing Commands

### Run All Tests (After)
```bash
cd repository_after
docker build -f Dockerfile.test -t test .
docker run --rm test
```

### Run Tests with Coverage
```bash
cd repository_after
docker build -f Dockerfile.test -t test .
docker run --rm test npm test -- --coverage --watchAll=false
```

### Run Specific Test File
```bash
cd repository_after
docker build -f Dockerfile.test -t test .
docker run --rm test npm test -- ActivityFeed.test.js
```

### Run Tests in Watch Mode (Interactive)
```bash
cd repository_after
docker run -it -v $(pwd):/app -v /app/node_modules activity-feed-after npm test
```

---

## 🛠️ Development Commands

### Access Container Shell
```bash
docker exec -it activity-feed-after sh
```

### Install New Package (Inside Container)
```bash
docker exec -it activity-feed-after npm install package-name
```

### Build Production Bundle
```bash
docker exec -it activity-feed-after npm run build
```

### Check Node Version
```bash
docker exec -it activity-feed-after node --version
docker exec -it activity-feed-after npm --version
```

---

## 🐛 Troubleshooting Commands

### Check Port Usage
```bash
# Linux/Mac
lsof -i :3000
lsof -i :3001

# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

### Force Rebuild (No Cache)
```bash
docker-compose build --no-cache
docker-compose up
```

### Remove and Recreate Containers
```bash
docker-compose down
docker-compose up --build --force-recreate
```

### Check Docker Status
```bash
docker info
docker version
```

### View Container Resource Usage
```bash
docker stats activity-feed-before
docker stats activity-feed-after
```

---

## 📊 Comparison Commands

### Run Both and Compare
```bash
# Terminal 1: Start both
docker-compose up --build

# Then open in browser:
# - http://localhost:3000 (Before - Original)
# - http://localhost:3001 (After - Optimized)

# Compare:
# - FPS indicators
# - Scroll smoothness
# - DOM node count (DevTools)
# - Memory usage (DevTools)
```

### Performance Monitoring
```bash
# Watch container stats
docker stats

# View logs for performance
docker-compose logs -f | grep -i fps
```

---

## 🎯 Quick Reference Table

| Task | Command |
|------|---------|
| **Start both** | `docker-compose up --build` |
| **Start before** | `cd repository_before/activity-feed-virtualization && docker-compose up --build` |
| **Start after** | `cd repository_after && docker-compose up --build` |
| **Stop all** | `docker-compose down` |
| **View logs** | `docker-compose logs -f` |
| **Run tests** | `cd repository_after && docker build -f Dockerfile.test -t test . && docker run --rm test` |
| **Rebuild** | `docker-compose build --no-cache && docker-compose up` |
| **Clean up** | `docker-compose down -v && docker system prune -a` |

---

## 💡 Pro Tips

### Run in Background
```bash
docker-compose up -d --build
```

### Follow Logs While Running
```bash
# In separate terminal
docker-compose logs -f
```

### Restart Single Service
```bash
docker-compose restart before
docker-compose restart after
```

### Scale Services (If Needed)
```bash
docker-compose up --scale after=1 --scale before=1
```

---

## ✅ Verification Checklist

After running commands, verify:

- [ ] **Before** accessible at http://localhost:3000
- [ ] **After** accessible at http://localhost:3001
- [ ] Both show Activity Feed interface
- [ ] FPS indicators visible
- [ ] Can change item count
- [ ] Filters work
- [ ] Scrolling is smooth (especially in After)
- [ ] No errors in console/logs

---

**🎉 All commands ready to use! No local installation needed!**
