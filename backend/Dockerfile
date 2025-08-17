FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
  libcairo2 \
  libpango-1.0-0 libpangocairo-1.0-0 libpangoft2-1.0-0 \
  libgdk-pixbuf-2.0-0 \
  libxrender1 libfontconfig1 xfonts-base xfonts-75dpi \
  fonts-noto fonts-noto-cjk fonts-noto-color-emoji \
  curl ca-certificates && rm -rf /var/lib/apt/lists/*

# If using pdfkit/wkhtmltopdf, uncomment:
# RUN apt-get update && apt-get install -y --no-install-recommends wkhtmltopdf && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 👇 Context is backend/, so copy from here
COPY requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# 👇 Copy the rest of the backend source
COPY . /app/backend/

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
