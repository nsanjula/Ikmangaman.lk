FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1

# System libs for PDF (WeasyPrint) + optional wkhtmltopdf + fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 libpangocairo-1.0-0 libpangoft2-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libxrender1 libfontconfig1 xfonts-base xfonts-75dpi \
    fonts-noto fonts-noto-cjk fonts-noto-color-emoji \
    curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# If your code uses pdfkit/wkhtmltopdf, uncomment this:
# RUN apt-get update && apt-get install -y --no-install-recommends wkhtmltopdf && \
#     rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/requirements.txt /app/backend/requirements.txt

# If you rely on PyTorch: (optional) install CPU wheels first, pinned
# RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu \
#     torch==2.3.1 torchvision==0.18.1 torchaudio==2.3.1

RUN pip install --no-cache-dir -r /app/backend/requirements.txt
COPY backend/ /app/backend/

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
