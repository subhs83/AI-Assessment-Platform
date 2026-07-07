FROM python:3.12-slim

# Prevent Python from buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies including Tesseract
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libtesseract-dev \
    poppler-utils \
    tesseract-ocr-eng \
    tesseract-ocr-hin \
    tesseract-ocr-san \
    tesseract-ocr-mar \
    tesseract-ocr-ben \
    tesseract-ocr-guj \
    tesseract-ocr-kan \
    tesseract-ocr-mal \
    tesseract-ocr-ori \
    tesseract-ocr-pan \
    tesseract-ocr-tam \
    tesseract-ocr-tel \
    tesseract-ocr-urd \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 10000

CMD ["./entrypoint.sh"]