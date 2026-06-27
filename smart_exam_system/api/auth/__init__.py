from flask import Blueprint

api_auth_bp = Blueprint(
    "api_auth",
    __name__,
    url_prefix="/api/auth"
)

from smart_exam_system.api.auth import routes