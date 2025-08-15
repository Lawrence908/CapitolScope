# ----- Builder Stage -----
FROM python:3.12-slim-bookworm AS builder

WORKDIR /build

# Install uv package manager
RUN pip install --no-cache-dir uv

# Copy project files in the structure expected by pyproject.toml
COPY pyproject.toml .
COPY README.md .
COPY app/ app/

# Install dependencies using uv
RUN uv pip install --no-cache-dir --system .

# Update apt for any additional packages
RUN apt-get update

# ----- Runtime Stage -----
FROM python:3.12-slim-bookworm

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser

# Set up directory structure
WORKDIR /app/src
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/src \
    LOG_DIR=/app/logs

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && \
    chown appuser:appuser /app/logs

# Install vim for debugging and any system dependencies
RUN apt-get update && \
    apt-get install -y \
        vim \
        curl \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies and application code from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY app/src/ .

# Copy Alembic configuration to /app/
COPY alembic.ini /app/alembic.ini
COPY alembic/ /app/alembic/

# Switch to non-root user
USER appuser

# Health check (use PORT with 8080 default for local runs)
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD sh -c 'curl -f http://localhost:${PORT:-8080}/health || exit 1'

EXPOSE 8080

# Default command for production (Cloud Run provides $PORT)
CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]