# run_migrations.py
from smart_exam_system.app import create_app
from smart_exam_system.extensions import db
from flask_migrate import Migrate

app = create_app()
migrate = Migrate(app, db)

with app.app_context():
    # Create migration folder if not exists
    from flask_migrate import init, migrate as fmigrate, upgrade

    import os
    if not os.path.exists('migrations'):
        init()
    fmigrate(message="Initial migration")
    upgrade()
