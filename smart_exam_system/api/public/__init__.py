from flask import Blueprint

api_public_bp = Blueprint(
    "api_public",
    __name__
)

# Import routes so they register
from smart_exam_system.api.public import routes