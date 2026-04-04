"""offers.offerer_rejection_seen_at for unseen-reject badges

Revision ID: e5f6a7b8c9d0
Revises: c3d4e5f6a7b8
Create Date: 2026-04-04 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e5f6a7b8c9d0"
down_revision: Union[str, Sequence[str], None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "offers",
        sa.Column(
            "offerer_rejection_seen_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )
    op.execute(
        """
        UPDATE offers
        SET offerer_rejection_seen_at = reviewed_at
        WHERE status = 'rejected' AND reviewed_at IS NOT NULL
        """
    )


def downgrade() -> None:
    op.drop_column("offers", "offerer_rejection_seen_at")
