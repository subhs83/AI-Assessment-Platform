
"""add system settings table

Revision ID: 8c433a574795
Revises: 19fd7b055e35
Create Date: 2026-11-21 22:36:45.760721
"""

from alembic import op
import sqlalchemy as sa


revision = '8c433a574795'
down_revision = '19fd7b055e35'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'system_settings',
        sa.Column('key', sa.String(length=100), nullable=False),
        sa.Column('value', sa.String(length=255), nullable=False),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint('key'),
    )


def downgrade():
    op.drop_table('system_settings')
