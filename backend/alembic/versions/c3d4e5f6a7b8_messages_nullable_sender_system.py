"""messages.sender_id nullable for TripMate system messages

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-04-04 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, Sequence[str], None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "messages",
        "sender_id",
        existing_type=sa.Integer(),
        existing_nullable=False,
        nullable=True,
    )


def downgrade() -> None:
    op.execute(
        """
        UPDATE messages SET sender_id = (
            SELECT cm.user_id FROM chat_members cm
            WHERE cm.chat_group_id = messages.chat_group_id
            ORDER BY cm.joined_at ASC LIMIT 1
        )
        WHERE sender_id IS NULL
        """
    )
    op.alter_column(
        "messages",
        "sender_id",
        existing_type=sa.Integer(),
        existing_nullable=True,
        nullable=False,
    )
