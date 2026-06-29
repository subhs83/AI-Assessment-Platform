import os
from flask import Flask
from .config import Config
from .extensions import login_manager, db, migrate
from flask_session import Session
# Blueprints
from .models import UserModel
from flask_cors import CORS

from .api.auth import api_auth_bp
from .api.student import api_student_bp
from .api.teacher import api_teacher_bp
from .api.admin import api_admin_bp
from .api.superAdmin import api_superadmin_bp
from .api.public import api_public_bp

from .api.utils.init_data import create_default_super_admin

def create_app():
    base_dir = os.path.dirname(os.path.dirname(__file__))

    app = Flask(__name__)
    # Config
    app.config.from_object(Config)

    # Session backend
    app.config["SESSION_TYPE"] = "filesystem"
    Session(app)

    # CORS (after session setup is OK)
    CORS(
    app,
    supports_credentials=True,
    origins=Config.CORS_ORIGINS,
)

    # Extensions
    login_manager.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)   # 🔥 ADD THIS LINE
    
       # User loader

    @login_manager.user_loader
    def load_user(user_id):
         
        return db.session.get(UserModel, user_id)

    # API Blueprint (NEW)
    app.register_blueprint(api_student_bp)
    app.register_blueprint(api_teacher_bp)
    app.register_blueprint(api_auth_bp)
    app.register_blueprint(api_admin_bp)
    app.register_blueprint(api_superadmin_bp)
    app.register_blueprint(api_public_bp)

    # with app.app_context():
    #     create_default_super_admin()

    return app

# 👇 THIS IS THE IMPORTANT PART
app = create_app()    
