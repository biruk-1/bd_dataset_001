# Single Dockerfile for the entire project
FROM node:18-alpine

WORKDIR /app

# Install system dependencies if needed
RUN apk add --no-cache git

# Copy root package.json (for evaluation scripts)
COPY package.json ./

# Install root dependencies first
RUN npm install

# Copy evaluation scripts
COPY evaluation/ ./evaluation/

# Copy test files
COPY tests/ ./tests/

# Copy both repositories
COPY repository_before/ ./repository_before/
COPY repository_after/ ./repository_after/

# Install dependencies for repository_before
WORKDIR /app/repository_before/activity-feed-virtualization
COPY repository_before/activity-feed-virtualization/package*.json ./
RUN npm install

# Install dependencies for repository_after
WORKDIR /app/repository_after
COPY repository_after/package*.json ./
RUN npm install

# Set working directory back to root
WORKDIR /app

# Default command
CMD ["node", "evaluation/evaluation.js"]
