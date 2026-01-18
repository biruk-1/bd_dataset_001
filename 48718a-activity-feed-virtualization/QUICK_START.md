# ⚡ Quick Start Guide

## 🎯 Fastest Way to Run (No Installation Needed!)

### Prerequisites
- ✅ Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- ❌ **NO Node.js needed**
- ❌ **NO npm needed**
- ❌ **NO package installation needed**

---

## 🚀 One Command to Run Both

```bash
docker-compose up --build
```

**That's it!** Then open:
- **Original**: http://localhost:3000
- **Optimized**: http://localhost:3001

---

## 📦 Run Individual Repositories

### Original Implementation (Before)
```bash
cd repository_before/activity-feed-virtualization
docker-compose up --build
```
→ http://localhost:3000

### Optimized Implementation (After)
```bash
cd repository_after
docker-compose up --build
```
→ http://localhost:3001

---

## 🛑 Stop Containers

```bash
docker-compose down
```

---

## 🧪 Run Tests

```bash
cd repository_after
docker build -f Dockerfile.test -t test .
docker run --rm test
```

---

## 📚 More Commands

See **[DOCKER_COMMANDS.md](./DOCKER_COMMANDS.md)** for complete documentation.

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Run both | `docker-compose up --build` |
| Run before only | `cd repository_before/activity-feed-virtualization && docker-compose up --build` |
| Run after only | `cd repository_after && docker-compose up --build` |
| Stop all | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Run tests | `cd repository_after && docker build -f Dockerfile.test -t test . && docker run --rm test` |

---

**🎉 You're ready! Everything runs in Docker - no local installation needed!**
