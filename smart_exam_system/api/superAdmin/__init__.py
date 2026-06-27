from flask import Blueprint

api_superadmin_bp = Blueprint("api_supradmin", __name__, url_prefix="/api/superadmin")

# Import modules so routes get registered
from smart_exam_system.api.superAdmin import routes
