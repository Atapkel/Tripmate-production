"""chat_members.trip_removal_seen_at for unseen host-removal notices

Revision ID: g7b8c9d0e1f2
Revises: f6a7b8c9d0e1
Create Date: 2026-04-04 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "g7b8c9d0e1f2"
down_revision: Union[str, Sequence[str], None] = "f6a7b8c9d0e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "chat_members",
        sa.Column(
            "trip_removal_seen_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )
    # Existing removed trips: treat as already seen (only new removals notify).
    op.execute(
        """
        UPDATE chat_members AS cm
        SET trip_removal_seen_at = NOW()
        FROM chat_groups cg
        JOIN trip_vacancies tv ON tv.id = cg.trip_vacancy_id
        WHERE cm.chat_group_id = cg.id
          AND tv.status = 'deleted_by_host'
        """
    )


def downgrade() -> None:
    op.drop_column("chat_members", "trip_removal_seen_at")
