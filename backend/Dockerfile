# backend/Dockerfile
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1

# System libs needed for PDFs + basic fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libpangoft2-1.0-0 \
    libgdk-pixbuf-2.0-0 libxrender1 libfontconfig1 xfonts-base xfonts-75dpi \
    fonts-noto curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Work from /app so "backend" is importable as a top-level package
WORKDIR /app
ENV PYTHONPATH=/app

# 1) CPU-only PyTorch (small; no CUDA deps)
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu \
    torch==2.3.1 torchvision==0.18.1

# 2) Rest of deps (requirements.txt must NOT include torch/vision/dotenv)
COPY requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# 3) App code (creates /app/backend/…)
COPY . /app/backend/

# 4) Start (bind to Railway's provided port)
CMD ["sh","-c","uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1 --log-level info"]

# backend/Dockerfile
#FROM python:3.11-slim
#
## ---- cache-buster: bump this when you need a clean rebuild ----
#ARG CACHE_BUSTER=2025-08-18-1838
#RUN echo "cache-bust=$CACHE_BUSTER"
#
#ENV PYTHONDONTWRITEBYTECODE=1 \
#    PYTHONUNBUFFERED=1 \
#    PIP_NO_CACHE_DIR=1
#
## ---- OS libs needed by WeasyPrint ----
#RUN apt-get update && apt-get install -y --no-install-recommends \
#    libcairo2 \
#    libpango-1.0-0 \
#    libpangoft2-1.0-0 \
#    libpangocairo-1.0-0 \
#    libgdk-pixbuf-2.0-0 \
#    libxml2 \
#    libxslt1.1 \
#    shared-mime-info \
#    fonts-dejavu-core \
#    fonts-liberation \
#    ca-certificates \
# && rm -rf /var/lib/apt/lists/*
#
#WORKDIR /app
#ENV PYTHONPATH=/app
#
## ---- CPU-only PyTorch (keep your versions) ----
#RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu \
#    torch==2.3.1 torchvision==0.18.1
#
## ---- Python deps (from this folder, because Root Directory = backend) ----
#COPY requirements.txt ./requirements.txt
#RUN pip install --upgrade pip && pip install --no-cache-dir -r ./requirements.txt
#
## ---- App code ----
## Copies everything in backend/ (context) into /app, including the "backend" package dir
#COPY . /app
#
## ---- Run FastAPI ----
#ENV PORT=8080
#EXPOSE 8080
#CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1", "--log-level", "info"]





