from flask import Blueprint

api_admin_bp = Blueprint("api_admin", __name__, url_prefix="/api/admin")

# Import modules so routes get registered
from smart_exam_system.api.admin import routes
