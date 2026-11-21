
"""remove obsolete show_result_review column

Revision ID: 19fd7b055e35
Revises: b52dfa8fc953
"""

from alembic import op
import sqlalchemy as sa


revision = '19fd7b055e35'
down_revision = 'b52dfa8fc953'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column('exams', 'show_result_review')


def downgrade():
    op.add_column(
        'exams',
        sa.Column(
            'show_result_review',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('false'),
        ),
    )
