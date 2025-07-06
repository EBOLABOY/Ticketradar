# Stage 1: Builder - Install dependencies
FROM python:3.12-slim AS builder

WORKDIR /app

# Create a virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Final image - Copy app and dependencies
FROM python:3.12-slim

WORKDIR /app

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Create a non-root user and switch to it
RUN useradd --create-home appuser
USER appuser

# Copy application code
COPY --chown=appuser:appuser ./ .

# Expose port and define command
EXPOSE 38181
CMD ["uvicorn", "main_fastapi:app", "--host", "0.0.0.0", "--port", "38181"]
