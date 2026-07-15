from flask import Blueprint

api_school_bp = Blueprint(
    "api_school",
    __name__,
    url_prefix="/api/school"
)

# Import routes so they register
from smart_exam_system.api.school import routes