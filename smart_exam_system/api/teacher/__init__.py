from flask import Blueprint

api_teacher_bp = Blueprint("api_teacher", __name__, url_prefix="/api/teacher")

# Import modules so routes get registered
from smart_exam_system.api.teacher import routes
from smart_exam_system.api.teacher import ai_routes