import os
from dotenv import load_dotenv
import pytesseract

load_dotenv()   

class Config:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    SECRET_KEY = os.getenv("SECRET_KEY")

    if os.getenv("FLASK_ENV") == "production" and not SECRET_KEY:
        raise RuntimeError("SECRET_KEY environment variable is required.")

    if not SECRET_KEY:
        SECRET_KEY = "dev-secret-key"
    
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "False") == "True"  # True only in HTTPS production
    SESSION_COOKIE_HTTPONLY = True

    # CORS
    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000"
    ).split(",")
    
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    
    
    TESSERACT_CMD = os.getenv("TESSERACT_CMD")

    if TESSERACT_CMD:
        pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

    # =========================
    # DATABASE CONFIG
    # =========================
    database_url = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:1234@localhost:5432/smart_exam_system"
    )

    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    SQLALCHEMY_DATABASE_URI = database_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # =========================
    # FILES
    # =========================
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
