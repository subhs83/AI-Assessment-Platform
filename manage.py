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