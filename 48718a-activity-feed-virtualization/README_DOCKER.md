# 🐳 Docker Setup - Activity Feed Virtualization

## Quick Start (No Local Installation Required!)

This project is fully dockerized. **You don't need Node.js or npm installed** - everything runs in Docker containers.

---

## 🚀 Fastest Way to Run

### Run Both Repositories (Before & After)

```bash
# From the root directory
docker-compose up --build
```

**Then open**:
- **Original (Before)**: http://localhost:3000
- **Optimized (After)**: http://localhost:3001

---

## 📦 Individual Repositories

### Run Original Implementation (Before)

```bash
cd repository_before/activity-feed-virtualization
docker-compose up --build
```

Access at: **http://localhost:3000**

### Run Optimized Implementation (After)

```bash
cd repository_after
docker-compose up --build
```

Access at: **http://localhost:3001**

---

## 🧪 Run Tests

### Test Optimized Version

```bash
cd repository_after
docker build -f Dockerfile.test -t test-image .
docker run --rm test-image
```

---

## 🛑 Stop Containers

```bash
# Stop both
docker-compose down

# Stop individual
cd repository_before/activity-feed-virtualization && docker-compose down
cd repository_after && docker-compose down
```

---

## 📖 Full Documentation

See **[DOCKER_COMMANDS.md](./DOCKER_COMMANDS.md)** for complete command reference, troubleshooting, and advanced usage.

---

## ✅ What You Get

- ✅ **No local installation needed** - Everything in Docker
- ✅ **Isolated environments** - No conflicts with local packages
- ✅ **Reproducible builds** - Same environment for everyone
- ✅ **Easy cleanup** - Just remove containers
- ✅ **Side-by-side comparison** - Run both simultaneously

---

**That's it! Just run `docker-compose up --build` and you're ready to go! 🎉**
