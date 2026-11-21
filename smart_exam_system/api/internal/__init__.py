from flask import Blueprint

api_internal_bp = Blueprint(
    "api_internal",
    __name__,
    url_prefix="/api/internal",
)

# Import routes so they register
from smart_exam_system.api.internal import routes