import enum
from datetime import date

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class TripVacancy(Base):
    __tablename__ = "trip_vacancies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    requester_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    # Destination
    destination_country_id = Column(Integer, ForeignKey("countries.id"), nullable=False, index=True)
    destination_city_id = Column(Integer, ForeignKey("cities.id"), nullable=False, index=True)

    # Dates
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    # Budget
    min_budget = Column(Numeric(precision=10, scale=2), nullable=True)
    max_budget = Column(Numeric(precision=10, scale=2), nullable=True)

    # Capacity
    people_needed = Column(Integer, nullable=False)
    people_joined = Column(Integer, default=0, nullable=False)

    # Details
    description = Column(Text, nullable=True)
 
    # Preference filters
    min_age = Column(Integer, nullable=True)
    max_age = Column(Integer, nullable=True)
    gender_preference = Column(String(20), nullable=True)

    # Status: open, matched, closed, cancelled, deleted_by_host (soft delete; chat kept)
    status = Column(String(20), default="open", nullable=False)

    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    destination_country = relationship("Country", lazy="joined")
    destination_city = relationship("City", lazy="joined")
    requester = relationship("User", back_populates="trip_vacancies")
    offers = relationship("Offer", back_populates="vacancy", cascade="all, delete-orphan")
    chat_group = relationship("ChatGroup", uselist=False, back_populates="trip_vacancy", cascade="all, delete-orphan")
    generated_plan = relationship(
        "GeneratedTripPlan", uselist=False, back_populates="trip_vacancy", cascade="all, delete-orphan"
    )

    @property
    def is_accepting_offers(self) -> bool:
        return self.status == "open" and self.people_joined < self.people_needed and self.end_date >= date.today()


class OfferStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_vacancy_id = Column(Integer, ForeignKey("trip_vacancies.id", ondelete="CASCADE"))
    offerer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    message = Column(Text, nullable=True)
    proposed_budget = Column(Numeric(precision=10, scale=2), nullable=True)

    # pending, accepted, rejected, cancelled
    status = Column(String(20), default="pending", nullable=False)

    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    offerer_outcome_seen_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    vacancy = relationship("TripVacancy", back_populates="offers")
    offerer = relationship("User", back_populates="offers")
