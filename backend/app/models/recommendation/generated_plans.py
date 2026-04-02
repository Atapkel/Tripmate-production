from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class GeneratedTripPlan(Base):
    __tablename__ = "generated_trip_plans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_vacancy_id = Column(
        Integer, ForeignKey("trip_vacancies.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    raw_response = Column(JSON, nullable=False)
    generation_requested_at = Column(DateTime(timezone=True), nullable=True)
    generated_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    trip_vacancy = relationship("TripVacancy", back_populates="generated_plan")
    recommended_places = relationship(
        "RecommendedPlace", back_populates="generated_plan", cascade="all, delete-orphan"
    )
