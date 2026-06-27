from flask import Blueprint

api_student_bp = Blueprint("api_student", __name__, url_prefix="/api/student")

# Import modules so routes get registered
from smart_exam_system.api.student import routes