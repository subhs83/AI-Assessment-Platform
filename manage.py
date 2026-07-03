import click
from smart_exam_system import create_app
from smart_exam_system.extensions import db
from smart_exam_system.api.utils.init_data import create_default_super_admin
from smart_exam_system.models.user import UserModel
from werkzeug.security import generate_password_hash
from smart_exam_system.api.utils.security import hash_password
app = create_app()

# -------------------------------
# CLI Commands
# -------------------------------

@app.cli.command("runserver")
def runserver():
    """Run the Flask development server."""
    app.run(debug=True)


@app.cli.command("create-admin")
def create_admin():
    """Create default super admin if not exists."""
    with app.app_context():
        create_default_super_admin()
        click.echo("✅ Super admin ensured.")

# -------------------------------
# CLI Reset Password Commands
# -------------------------------

@app.cli.command("reset-super-admin")
@click.option("--email", prompt=True)
@click.option("--password", prompt=True)
def reset_super_admin(email, password):
    """Reset super admin password."""

    with app.app_context():

        user = UserModel.query.filter_by(
            email=email,
            role="super_admin"
        ).first()

        if not user:
            click.echo("❌ Super admin not found.")
            return

        user.password = hash_password(password)

        # Optional
        user.force_password_change = True

        db.session.commit()

        click.echo("✅ Super admin password reset successfully.")


@app.cli.command("reset-db")
def reset_db():
    """Drop and recreate all tables"""
    with app.app_context():
        click.echo("⚠️ Dropping all tables...")

        db.drop_all()
        db.create_all()

        click.echo("✅ Database reset complete")



@app.cli.command("seed-db")
def seed_db():
    """Insert initial development data"""

    with app.app_context():
        click.echo("🌱 Seeding database...")

        from smart_exam_system.models.school import SchoolModel
        from smart_exam_system.models.user import UserModel

        # Create default school
        school = SchoolModel(
            name="Demo School",
            slug="demo-school"
        )
        db.session.add(school)
        db.session.commit()

        # Create admin user
        admin = UserModel(
            email="admin@demo.com",
            role="teacher",
            school_id=school.id,
            password=generate_password_hash("admin123")
        )
        db.session.add(admin)
        db.session.commit()

        click.echo("✅ Seed complete")



@app.cli.command("reset-seed")
def reset_seed():
    """Full reset + seed"""

    with app.app_context():
        click.echo("🔁 Resetting database...")

        db.drop_all()
        db.create_all()

        click.echo("🌱 Seeding database...")

        from smart_exam_system.models.school import SchoolModel
        from smart_exam_system.models.user import UserModel

        school = SchoolModel(
            name="Demo School",
            slug="demo-school"
        )
        db.session.add(school)
        db.session.commit()

        admin = UserModel(
            email="admin@demo.com",
            role="teacher",
            school_id=school.id,
            password=generate_password_hash("admin123")
        )
        db.session.add(admin)
        db.session.commit()

        click.echo("🚀 Reset + Seed complete")