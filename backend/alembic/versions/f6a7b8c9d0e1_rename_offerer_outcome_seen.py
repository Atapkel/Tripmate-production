"""rename offerer_rejection_seen_at -> offerer_outcome_seen (accept + reject)

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-04-04 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "f6a7b8c9d0e1"
down_revision: Union[str, Sequence[str], None] = "e5f6a7b8c9d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE offers RENAME COLUMN offerer_rejection_seen_at TO offerer_outcome_seen_at"
    )
    # Historical accepts: same as rejects — only new host decisions after deploy surface as unseen.
    op.execute(
        """
        UPDATE offers
        SET offerer_outcome_seen_at = reviewed_at
        WHERE status = 'accepted' AND reviewed_at IS NOT NULL
        """
    )


def downgrade() -> None:
    op.execute(
        "ALTER TABLE offers RENAME COLUMN offerer_outcome_seen_at TO offerer_rejection_seen_at"
    )
