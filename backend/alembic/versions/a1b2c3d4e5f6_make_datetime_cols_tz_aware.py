"""make datetime columns timezone aware

Revision ID: a1b2c3d4e5f6
Revises: 7d4611a9212a
Create Date: 2026-04-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '7d4611a9212a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # generated_trip_plans
    op.alter_column('generated_trip_plans', 'generation_requested_at',
                     type_=sa.DateTime(timezone=True), existing_type=sa.DateTime())
    op.alter_column('generated_trip_plans', 'generated_at',
                     type_=sa.DateTime(timezone=True), existing_type=sa.DateTime())
    op.alter_column('generated_trip_plans', 'created_at',
                     type_=sa.DateTime(timezone=True), existing_type=sa.DateTime())
    op.alter_column('generated_trip_plans', 'updated_at',
                     type_=sa.DateTime(timezone=True), existing_type=sa.DateTime())

    # recommended_places
    op.alter_column('recommended_places', 'created_at',
                     type_=sa.DateTime(timezone=True), existing_type=sa.DateTime())


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('generated_trip_plans', 'generation_requested_at',
                     type_=sa.DateTime(), existing_type=sa.DateTime(timezone=True))
    op.alter_column('generated_trip_plans', 'generated_at',
                     type_=sa.DateTime(), existing_type=sa.DateTime(timezone=True))
    op.alter_column('generated_trip_plans', 'created_at',
                     type_=sa.DateTime(), existing_type=sa.DateTime(timezone=True))
    op.alter_column('generated_trip_plans', 'updated_at',
                     type_=sa.DateTime(), existing_type=sa.DateTime(timezone=True))
    op.alter_column('recommended_places', 'created_at',
                     type_=sa.DateTime(), existing_type=sa.DateTime(timezone=True))
