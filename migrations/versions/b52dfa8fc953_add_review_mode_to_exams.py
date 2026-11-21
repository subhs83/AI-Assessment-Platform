
"""add review_mode to exams

Revision ID: b52dfa8fc953
Revises: 865e71540eed
Create Date: 2026-11-21 21:16:35.999249

"""
from alembic import op
import sqlalchemy as sa


revision = 'b52dfa8fc953'
down_revision = '865e71540eed'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'exams',
        sa.Column(
            'review_mode',
            sa.String(length=20),
            nullable=False,
            server_default=sa.text("'questions_only'"),
        ),
    )


def downgrade():
    op.drop_column('exams', 'review_mode')
