from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class RecommendedPlace(Base):
    __tablename__ = "recommended_places"

    id = Column(Integer, primary_key=True, autoincrement=True)
    generated_plan_id = Column(
        Integer, ForeignKey("generated_trip_plans.id", ondelete="CASCADE"), nullable=False
    )

    place_id = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)

    # Descriptions
    short_description = Column(Text, nullable=True)
    why_people_go = Column(Text, nullable=True)
    why_recommended = Column(Text, nullable=True)

    # JSON fields
    best_season = Column(JSON, nullable=True)
    audience = Column(JSON, nullable=True)

    # Practical info
    best_time_of_day = Column(String(50), nullable=True)

    # Ratings

    image_url = Column(String(1000), nullable=True)
    query_to_search = Column(String(255), nullable=True)

    raw_payload = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)

    # Relationships
    generated_plan = relationship("GeneratedTripPlan", back_populates="recommended_places")
