# Use Python 3.11 as the base image
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Install curl (useful for health checks)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PORT=5000 \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    GUNICORN_TIMEOUT=300 \
    GUNICORN_THREADS=4 \
    IMAP_TIMEOUT=45

# Copy dependency files
COPY requirements.txt .

# Install dependencies (including production server)
RUN pip install --upgrade pip && \
    pip install -r requirements.txt && \
    pip install gunicorn

# Copy application code
COPY . .

# Create data directory
RUN mkdir -p /app/data

# Expose the port using the variable
EXPOSE ${PORT:-5000}

# Start the application
# Maintains a single worker with threads to improve fault tolerance for slow requests
CMD ["sh", "-c", "gunicorn -k gthread -w 1 --threads ${GUNICORN_THREADS:-4} -b 0.0.0.0:${PORT} --timeout ${GUNICORN_TIMEOUT:-300} --graceful-timeout 30 --access-logfile - --error-logfile - --capture-output web_outlook_app:app"]