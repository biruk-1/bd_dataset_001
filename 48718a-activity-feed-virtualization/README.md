# Activity Feed Virtualization – Enterprise Frontend Performance Challenge

## 🐳 Quick Start with Docker (No Installation Needed!)

**Fastest way to run both repositories:**

```bash
docker-compose up --build
```

Then open:
- **Original (Before)**: http://localhost:3000
- **Optimized (After)**: http://localhost:3001

**No Node.js or npm installation required!** Everything runs in Docker containers.

📖 **See [QUICK_START.md](./QUICK_START.md) or [DOCKER_COMMANDS.md](./DOCKER_COMMANDS.md) for detailed instructions.**

---

## Prompt
You are a **Senior Frontend Performance Engineer** at a software development platform similar to GitHub or GitLab.  
The platform serves **enterprise teams with 500+ members**, generating **10,000+ daily activity events** including commits, pull requests, comments, deployments, and mentions.

Your task is to refactor an **inefficient Activity Feed** to support **enterprise-scale performance** using **windowed virtualization (virtual scrolling)** implemented **from scratch in React**, without relying on any external virtualization libraries.

---

## Problem Statement
The current Activity Feed renders **every activity item into the DOM**, regardless of whether it is visible in the viewport.

As activity volume grows, this approach causes:
- Severe performance degradation
- Poor scrolling experience
- Excessive memory consumption
- Long initial render times

This makes the application unusable for large enterprise teams.

---

## Current (Problematic) Implementation

```jsx
// Naive implementation – renders ALL items
<div className="activity-list">
  {activities.map(activity => (
    <ActivityItem key={activity.id} activity={activity} />
  ))}
</div>
