"""add student registration type

Revision ID: bd5c35239e5b
Revises: 6e2ea28ca11b
Create Date: 2026-07-04 22:25:00.833926

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'bd5c35239e5b'
down_revision = '6e2ea28ca11b'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("students") as batch_op:
        batch_op.add_column(
            sa.Column(
                "student_registration_type",
                sa.String(length=20),
                nullable=False,
                server_default="OPEN",
            )
        )

    # Existing students are official school students
    op.execute("""
        UPDATE students
        SET student_registration_type = 'VERIFIED'
    """)

    with op.batch_alter_table("students") as batch_op:
        batch_op.alter_column(
            "student_registration_type",
            server_default=None,
        )


def downgrade():
    with op.batch_alter_table("students") as batch_op:
        batch_op.drop_column("student_registration_type")

    # ### end Alembic commands ###
