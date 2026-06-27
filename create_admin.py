# create_admin.py
from smart_exam_system.app import create_app
from smart_exam_system.api.utils.init_data import create_default_super_admin

app = create_app()

with app.app_context():
    create_default_super_admin()
