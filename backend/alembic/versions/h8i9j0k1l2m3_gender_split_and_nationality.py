"""Add gender split (male_needed/female_needed) and nationality preference to trip vacancies

Revision ID: h8i9j0k1l2m3
Revises: 808ebc8639ef
Create Date: 2026-04-04 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "h8i9j0k1l2m3"
down_revision: Union[str, Sequence[str], None] = "808ebc8639ef"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create nationalities table
    op.create_table(
        "nationalities",
        sa.Column("id", sa.Integer(), autoincrement=True, primary_key=True),
        sa.Column("name", sa.String(100), unique=True, nullable=False),
    )

    # 2. Seed nationalities
    nationalities_table = sa.table(
        "nationalities",
        sa.column("id", sa.Integer),
        sa.column("name", sa.String),
    )
    op.bulk_insert(
        nationalities_table,
        [
            {"id": 1, "name": "Kazakh"},
            {"id": 2, "name": "Russian"},
            {"id": 3, "name": "Uzbek"},
            {"id": 4, "name": "Kyrgyz"},
            {"id": 5, "name": "Tajik"},
            {"id": 6, "name": "Turkmen"},
            {"id": 7, "name": "Arab"},
            {"id": 8, "name": "Turkish"},
            {"id": 9, "name": "Chinese"},
            {"id": 10, "name": "Korean"},
            {"id": 11, "name": "Japanese"},
            {"id": 12, "name": "Indian"},
            {"id": 13, "name": "Pakistani"},
            {"id": 14, "name": "Iranian"},
            {"id": 15, "name": "Afghan"},
            {"id": 16, "name": "Mongolian"},
            {"id": 17, "name": "Georgian"},
            {"id": 18, "name": "Azerbaijani"},
            {"id": 19, "name": "Armenian"},
            {"id": 20, "name": "Ukrainian"},
            {"id": 21, "name": "Belarusian"},
            {"id": 22, "name": "American"},
            {"id": 23, "name": "British"},
            {"id": 24, "name": "German"},
            {"id": 25, "name": "French"},
            {"id": 26, "name": "Italian"},
            {"id": 27, "name": "Spanish"},
            {"id": 28, "name": "Brazilian"},
            {"id": 29, "name": "Malaysian"},
            {"id": 30, "name": "Indonesian"},
            {"id": 31, "name": "Thai"},
            {"id": 32, "name": "Vietnamese"},
            {"id": 33, "name": "Filipino"},
            {"id": 34, "name": "Egyptian"},
            {"id": 35, "name": "Nigerian"},
            {"id": 36, "name": "South African"},
            {"id": 37, "name": "Canadian"},
            {"id": 38, "name": "Australian"},
            {"id": 39, "name": "Mexican"},
            {"id": 40, "name": "Other"},
        ],
    )

    # 3. Add new columns to trip_vacancies
    op.add_column("trip_vacancies", sa.Column("male_needed", sa.Integer(), nullable=True))
    op.add_column("trip_vacancies", sa.Column("female_needed", sa.Integer(), nullable=True))
    op.add_column("trip_vacancies", sa.Column("male_joined", sa.Integer(), server_default="0", nullable=False))
    op.add_column("trip_vacancies", sa.Column("female_joined", sa.Integer(), server_default="0", nullable=False))
    op.add_column(
        "trip_vacancies",
        sa.Column("nationality_preference_id", sa.Integer(), nullable=True),
    )
    op.create_index("ix_trip_vacancies_nationality_preference_id", "trip_vacancies", ["nationality_preference_id"])
    op.create_foreign_key(
        "fk_trip_vacancies_nationality_preference_id",
        "trip_vacancies",
        "nationalities",
        ["nationality_preference_id"],
        ["id"],
    )

    # 4. Migrate gender_preference data to new columns
    #    male   → male_needed = people_needed, female_needed = 0
    #    female → male_needed = 0, female_needed = people_needed
    #    any/null → leave both null (any gender)
    op.execute(
        """
        UPDATE trip_vacancies
        SET male_needed = people_needed, female_needed = 0
        WHERE gender_preference = 'male'
        """
    )
    op.execute(
        """
        UPDATE trip_vacancies
        SET male_needed = 0, female_needed = people_needed
        WHERE gender_preference = 'female'
        """
    )

    # 5. Default existing trip vacancies' nationality preference to Kazakh (id=1)
    op.execute(
        """
        UPDATE trip_vacancies
        SET nationality_preference_id = 1
        WHERE nationality_preference_id IS NULL
        """
    )

    # 6. Drop old gender_preference column
    op.drop_column("trip_vacancies", "gender_preference")


def downgrade() -> None:
    # Re-add gender_preference
    op.add_column("trip_vacancies", sa.Column("gender_preference", sa.String(20), nullable=True))

    # Migrate data back
    op.execute(
        """
        UPDATE trip_vacancies
        SET gender_preference = 'male'
        WHERE male_needed IS NOT NULL AND male_needed > 0
          AND (female_needed IS NULL OR female_needed = 0)
        """
    )
    op.execute(
        """
        UPDATE trip_vacancies
        SET gender_preference = 'female'
        WHERE female_needed IS NOT NULL AND female_needed > 0
          AND (male_needed IS NULL OR male_needed = 0)
        """
    )
    op.execute(
        """
        UPDATE trip_vacancies
        SET gender_preference = 'any'
        WHERE male_needed IS NOT NULL AND male_needed > 0
          AND female_needed IS NOT NULL AND female_needed > 0
        """
    )

    # Drop new columns
    op.drop_constraint("fk_trip_vacancies_nationality_preference_id", "trip_vacancies", type_="foreignkey")
    op.drop_index("ix_trip_vacancies_nationality_preference_id", "trip_vacancies")
    op.drop_column("trip_vacancies", "nationality_preference_id")
    op.drop_column("trip_vacancies", "female_joined")
    op.drop_column("trip_vacancies", "male_joined")
    op.drop_column("trip_vacancies", "female_needed")
    op.drop_column("trip_vacancies", "male_needed")

    # Drop nationalities table
    op.drop_table("nationalities")
