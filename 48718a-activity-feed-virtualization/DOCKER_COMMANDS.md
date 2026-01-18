# 🐳 Docker Commands Guide

This guide provides all the commands needed to run both `repository_before` and `repository_after` using Docker, **without installing any packages on your local machine**.

---

## 📋 Prerequisites

**Only requirement**: Docker and Docker Compose installed on your system.

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: Usually included with Docker Desktop

**No need for**:
- ❌ Node.js installation
- ❌ npm installation
- ❌ Package installation
- ❌ Any local dependencies

---

## 🚀 Quick Start

### Option 1: Run Both Repositories Simultaneously

From the root directory (`48718a-activity-feed-virtualization/`):

```bash
# Build and start both containers
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

**Access**:
- **Before (Original)**: http://localhost:3000
- **After (Optimized)**: http://localhost:3001

**Stop both**:
```bash
docker-compose down
```

---

## 📦 Individual Repository Commands

### Run Repository Before (Original Implementation)

#### Method 1: Using docker-compose (Recommended)

```bash
cd repository_before/activity-feed-virtualization

# Build and start
docker-compose up --build

# Or in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

**Access**: http://localhost:3000

#### Method 2: Using Docker directly

```bash
cd repository_before/activity-feed-virtualization

# Build image
docker build -t activity-feed-before .

# Run container
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules activity-feed-before

# Or in detached mode
docker run -d -p 3000:3000 -v $(pwd):/app -v /app/node_modules --name activity-before activity-feed-before
```

**Stop container**:
```bash
docker stop activity-before
docker rm activity-before
```

---

### Run Repository After (Optimized Implementation)

#### Method 1: Using docker-compose (Recommended)

```bash
cd repository_after

# Build and start
docker-compose up --build

# Or in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

**Access**: http://localhost:3001

#### Method 2: Using Docker directly

```bash
cd repository_after

# Build image
docker build -t activity-feed-after .

# Run container
docker run -p 3001:3000 -v $(pwd):/app -v /app/node_modules activity-feed-after

# Or in detached mode
docker run -d -p 3001:3000 -v $(pwd):/app -v /app/node_modules --name activity-after activity-feed-after
```

**Stop container**:
```bash
docker stop activity-after
docker rm activity-after
```

---

## 🧪 Running Tests in Docker

### Run Tests for Repository After

```bash
cd repository_after

# Build test image
docker build -f Dockerfile.test -t activity-feed-after-test .

# Run tests
docker run --rm activity-feed-after-test

# Run tests with coverage
docker run --rm activity-feed-after-test npm test -- --coverage --watchAll=false
```

### Run Tests for Repository Before

```bash
cd repository_before/activity-feed-virtualization

# Build test image
docker build -f Dockerfile.test -t activity-feed-before-test .

# Run tests
docker run --rm activity-feed-before-test
```

---

## 🔧 Useful Docker Commands

### View Running Containers

```bash
# List all containers
docker ps

# List all containers (including stopped)
docker ps -a

# View logs
docker logs activity-feed-before
docker logs activity-feed-after
```

### Execute Commands in Running Container

```bash
# Open shell in container
docker exec -it activity-feed-before sh
docker exec -it activity-feed-after sh

# Run npm commands
docker exec -it activity-feed-after npm test
docker exec -it activity-feed-after npm run build
```

### Clean Up

```bash
# Stop and remove containers
docker-compose down

# Remove volumes
docker-compose down -v

# Remove images
docker rmi activity-feed-before activity-feed-after

# Clean everything (containers, images, volumes)
docker system prune -a
```

---

## 📊 Comparison Mode

### Run Both Side-by-Side

```bash
# From root directory
docker-compose up --build
```

Then open two browser windows:
- **Left**: http://localhost:3000 (Before - Original)
- **Right**: http://localhost:3001 (After - Optimized)

Compare performance:
- Check FPS indicators
- Compare scroll smoothness
- Monitor DOM nodes in DevTools
- Test with different item counts

---

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

**Option 1**: Stop the conflicting service
```bash
# Find what's using the port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Stop it or change port in docker-compose.yml
```

**Option 2**: Change ports in docker-compose.yml
```yaml
ports:
  - "3002:3000"  # Change 3000 to any available port
```

### Container Won't Start

```bash
# Check logs
docker-compose logs

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

### Node Modules Issues

```bash
# Remove node_modules volume and rebuild
docker-compose down -v
docker-compose up --build
```

### Permission Issues (Linux)

```bash
# Fix permissions
sudo chown -R $USER:$USER .
docker-compose up --build
```

---

## 📝 Complete Command Reference

### Repository Before

```bash
# Navigate
cd repository_before/activity-feed-virtualization

# Start
docker-compose up --build

# Stop
docker-compose down

# Rebuild
docker-compose build --no-cache

# View logs
docker-compose logs -f app
```

### Repository After

```bash
# Navigate
cd repository_after

# Start
docker-compose up --build

# Stop
docker-compose down

# Rebuild
docker-compose build --no-cache

# View logs
docker-compose logs -f app

# Run tests
docker build -f Dockerfile.test -t test-image .
docker run --rm test-image
```

### Both Together

```bash
# From root directory
cd 48718a-activity-feed-virtualization

# Start both
docker-compose up --build

# Stop both
docker-compose down

# View logs for both
docker-compose logs -f
```

---

## ✅ Verification Checklist

After running, verify:

- [ ] **Before** accessible at http://localhost:3000
- [ ] **After** accessible at http://localhost:3001
- [ ] Both show Activity Feed interface
- [ ] FPS indicators visible
- [ ] Can change item count
- [ ] Filters work
- [ ] Scrolling is smooth (especially in After)

---

## 🎯 Quick Reference Card

```bash
# ============================================
# QUICK COMMANDS
# ============================================

# Run both repositories
docker-compose up --build

# Run only Before
cd repository_before/activity-feed-virtualization && docker-compose up --build

# Run only After
cd repository_after && docker-compose up --build

# Stop everything
docker-compose down

# Run tests (After)
cd repository_after && docker build -f Dockerfile.test -t test . && docker run --rm test

# View logs
docker-compose logs -f

# Clean up
docker-compose down -v
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [React in Docker Best Practices](https://mherman.org/blog/dockerizing-a-react-app/)

---

**🎉 You're all set! No local package installation needed - everything runs in Docker containers!**
