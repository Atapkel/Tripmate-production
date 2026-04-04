"""chat_members last_read_message_id for unread counts

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-04-04 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "chat_members",
        sa.Column("last_read_message_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_chat_members_last_read_message_id",
        "chat_members",
        "messages",
        ["last_read_message_id"],
        ["id"],
        ondelete="SET NULL",
    )
    # Catch up existing members so old messages are not counted as unread.
    op.execute(
        """
        UPDATE chat_members cm
        SET last_read_message_id = (
            SELECT MAX(m.id) FROM messages m WHERE m.chat_group_id = cm.chat_group_id
        )
        WHERE EXISTS (
            SELECT 1 FROM messages m2 WHERE m2.chat_group_id = cm.chat_group_id
        )
        """
    )


def downgrade() -> None:
    op.drop_constraint("fk_chat_members_last_read_message_id", "chat_members", type_="foreign_key")
    op.drop_column("chat_members", "last_read_message_id")
