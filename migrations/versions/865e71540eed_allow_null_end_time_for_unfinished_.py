"""Allow null end time for unfinished attempts

Revision ID: 865e71540eed
Revises: 4aceb2b9aaae
Create Date: 2026-10-31 23:10:44.159078

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '865e71540eed'
down_revision = '4aceb2b9aaae'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('student_attempts', schema=None) as batch_op:
        batch_op.alter_column(
            'end_time',
            existing_type=postgresql.TIMESTAMP(),
            nullable=True
        )


def downgrade():
    # PostgreSQL cannot restore NOT NULL while unfinished
    # attempts have NULL end_time values.
    op.execute("""
        UPDATE student_attempts
        SET end_time = start_time
        WHERE end_time IS NULL
    """)

    with op.batch_alter_table('student_attempts', schema=None) as batch_op:
        batch_op.alter_column(
            'end_time',
            existing_type=postgresql.TIMESTAMP(),
            nullable=False
        )

    # ### end Alembic commands ###
