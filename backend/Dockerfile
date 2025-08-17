#FROM python:3.11-slim
#ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
#
#RUN apt-get update && apt-get install -y --no-install-recommends \
#  libcairo2 \
#  libpango-1.0-0 libpangocairo-1.0-0 libpangoft2-1.0-0 \
#  libgdk-pixbuf-2.0-0 \
#  libxrender1 libfontconfig1 xfonts-base xfonts-75dpi \
#  fonts-noto fonts-noto-cjk fonts-noto-color-emoji \
#  curl ca-certificates && rm -rf /var/lib/apt/lists/*
#
## If using pdfkit/wkhtmltopdf, uncomment:
## RUN apt-get update && apt-get install -y --no-install-recommends wkhtmltopdf && rm -rf /var/lib/apt/lists/*
#
#WORKDIR /app
#
## 👇 Context is backend/, so copy from here
#COPY requirements.txt /app/backend/requirements.txt
#RUN pip install --no-cache-dir -r /app/backend/requirements.txt
#
## 👇 Copy the rest of the backend source
#COPY . /app/backend/
#
#CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]

#####################

# backend/Dockerfile
#FROM python:3.11-slim
#ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
#
#RUN apt-get update && apt-get install -y --no-install-recommends \
#    libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libpangoft2-1.0-0 \
#    libgdk-pixbuf-2.0-0 libxrender1 libfontconfig1 xfonts-base xfonts-75dpi \
#    fonts-noto fonts-noto-cjk fonts-noto-color-emoji curl ca-certificates && \
#    rm -rf /var/lib/apt/lists/*
#
#WORKDIR /app/backend
#
#COPY requirements.txt /app/backend/requirements.txt
#RUN pip install --no-cache-dir -r /app/backend/requirements.txt
#COPY . /app/backend/
#
## use ${PORT:-8080} so it works locally and on Railway
#CMD ["sh","-c","uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1"]

#FROM python:3.11-slim
#ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
#
## System libs for PDF, fonts
#RUN apt-get update && apt-get install -y --no-install-recommends \
#    libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libpangoft2-1.0-0 \
#    libgdk-pixbuf-2.0-0 libxrender1 libfontconfig1 xfonts-base xfonts-75dpi \
#    fonts-noto curl ca-certificates && \
#    rm -rf /var/lib/apt/lists/*
#
#WORKDIR /app/backend
#
## --- CPU-only PyTorch (small, no CUDA) ---
#RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu \
#    torch==2.3.1 torchvision==0.18.1
#
## --- The rest of your deps (requirements.txt MUST NOT include torch/vision/dotenv) ---
#COPY requirements.txt /app/backend/requirements.txt
#RUN pip install --no-cache-dir -r /app/backend/requirements.txt
#
## --- App code ---
#COPY . /app/backend/
#
## --- Start ---
#CMD ["sh","-c","uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1 --log-level info"]

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



