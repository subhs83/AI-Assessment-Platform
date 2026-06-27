# extensions.py

from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask import jsonify

# -------------------
# Extensions
# -------------------
login_manager = LoginManager()

# Keep this for Jinja-based login flow
login_manager.login_view = "auth.login"

db = SQLAlchemy()
migrate = Migrate()


# -------------------
# API-friendly auth handling
# -------------------
@login_manager.unauthorized_handler
def unauthorized():
    """
    This replaces Flask-Login default redirect behavior.
    Instead of redirecting to /auth/login,
    API requests get a proper JSON response.
    """
    return jsonify({
        "success": False,
        "message": "Unauthorized"
    }), 401