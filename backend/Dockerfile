FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV and EXIF parsing
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml requirements.txt* ./
RUN pip install --no-cache-dir fastapi uvicorn[standard] pydantic pydantic-settings scikit-learn numpy pandas scipy opencv-python-headless pillow piexif sqlalchemy python-multipart

COPY app ./backend/app
COPY conftest.py ./backend/conftest.py
COPY run.py ./backend/run.py

ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["python", "backend/run.py"]
