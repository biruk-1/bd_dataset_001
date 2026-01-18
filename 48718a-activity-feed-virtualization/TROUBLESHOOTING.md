# 🔧 Troubleshooting Guide

## Common Issues and Solutions

---

## ❌ Error: 'react-scripts' is not recognized

**Problem**: You're trying to run `npm start` locally without installing dependencies.

**Solution**: Use Docker instead (no local installation needed)!

```bash
# From root directory
docker-compose up --build
```

**OR** if you want to run locally, install dependencies first:

```bash
cd repository_after
npm install
npm start
```

---

## ❌ Error: Missing script: "start" or "dev"

**Problem**: You're in the wrong directory (root directory has no package.json).

**Solution**: 
- Use Docker from root: `docker-compose up --build`
- OR navigate to the correct directory:
  - For After: `cd repository_after`
  - For Before: `cd repository_before/activity-feed-virtualization`

---

## ❌ Error: npm ci requires package-lock.json

**Problem**: Dockerfile was using `npm ci` without package-lock.json.

**Solution**: ✅ **FIXED** - Dockerfiles now use `npm install` which works without package-lock.json.

---

## ❌ Error: Port already in use

**Problem**: Port 3000 or 3001 is already being used by another application.

**Solutions**:

### Option 1: Stop the conflicting service
```bash
# Find what's using the port (Windows)
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Option 2: Change ports in docker-compose.yml
Edit `docker-compose.yml` and change:
```yaml
ports:
  - "3002:3000"  # Change 3000 to any available port
```

---

## ❌ Error: Docker build fails

**Problem**: Various build issues.

**Solutions**:

### Clean rebuild
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Check Docker is running
```bash
docker ps
# If this fails, start Docker Desktop
```

### Check disk space
```bash
docker system df
# Clean up if needed
docker system prune -a
```

---

## ❌ Error: Container won't start

**Problem**: Container exits immediately.

**Solutions**:

### Check logs
```bash
docker-compose logs
docker-compose logs after
docker-compose logs before
```

### Check if ports are available
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

### Rebuild from scratch
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

---

## ❌ Error: Permission denied (Linux/Mac)

**Problem**: File permission issues.

**Solution**:
```bash
sudo chown -R $USER:$USER .
docker-compose up --build
```

---

## ❌ Error: Module not found

**Problem**: Dependencies not installed in container.

**Solution**: Rebuild the container
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

---

## ❌ Error: Hot reload not working

**Problem**: File changes not reflected in browser.

**Solutions**:

### Check volume mounts
Ensure volumes are properly mounted in docker-compose.yml:
```yaml
volumes:
  - ./repository_after:/app
  - /app/node_modules
```

### Check environment variables
```yaml
environment:
  - CHOKIDAR_USEPOLLING=true
  - WATCHPACK_POLLING=true
```

### Restart container
```bash
docker-compose restart after
```

---

## ❌ Error: Cannot connect to Docker daemon

**Problem**: Docker Desktop is not running.

**Solution**: 
1. Start Docker Desktop
2. Wait for it to fully start
3. Try again: `docker-compose up --build`

---

## ❌ Error: Out of memory

**Problem**: Docker doesn't have enough memory allocated.

**Solution**:
1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase Memory allocation (recommended: 4GB+)
4. Apply & Restart
5. Try again

---

## ✅ Quick Fixes Checklist

If something isn't working:

1. **Check Docker is running**
   ```bash
   docker ps
   ```

2. **Stop all containers**
   ```bash
   docker-compose down
   ```

3. **Clean rebuild**
   ```bash
   docker-compose build --no-cache
   docker-compose up
   ```

4. **Check logs**
   ```bash
   docker-compose logs -f
   ```

5. **Verify ports are free**
   ```bash
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   ```

---

## 🆘 Still Having Issues?

### Get More Information

```bash
# View all container logs
docker-compose logs

# View specific service logs
docker-compose logs after
docker-compose logs before

# Check container status
docker ps -a

# Check Docker system info
docker info

# Check Docker version
docker --version
docker-compose --version
```

### Common Solutions

1. **Restart Docker Desktop**
2. **Clean everything and rebuild**
   ```bash
   docker-compose down -v
   docker system prune -a
   docker-compose up --build
   ```
3. **Check system resources** (CPU, Memory, Disk)
4. **Update Docker Desktop** to latest version

---

## 📚 Related Documentation

- [QUICK_START.md](./QUICK_START.md) - Fastest way to get started
- [DOCKER_COMMANDS.md](./DOCKER_COMMANDS.md) - Complete command reference
- [COMMANDS_REFERENCE.md](./COMMANDS_REFERENCE.md) - All commands

---

**Remember: The easiest way is to use Docker - no local installation needed!**

```bash
docker-compose up --build
```
