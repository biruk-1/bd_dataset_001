# Dockerfile for evaluation and testing
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files
COPY . /app

# Set Python path
ENV PYTHONPATH=/app

# Default command (can be overridden)
CMD ["python", "evaluation/evaluation.py"]
