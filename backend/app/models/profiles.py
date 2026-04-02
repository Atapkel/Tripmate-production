from sqlalchemy import Column, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(20), nullable=False)

    # Location
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=True, index=True)
    nationality = Column(String(100), nullable=True)

    # Contact
    phone = Column(String(20), nullable=True)
    instagram_handle = Column(String(100), nullable=True)
    telegram_handle = Column(String(100), nullable=True)

    # Details
    bio = Column(Text, nullable=True)
    profile_photo = Column(String(500), nullable=True)

    # Relationships
    user = relationship("User", back_populates="profile")
    country = relationship("Country", lazy="joined")
    city = relationship("City", lazy="joined")
    languages = relationship("UserLanguage", back_populates="profile", cascade="all, delete-orphan")
    interests = relationship("UserInterest", back_populates="profile", cascade="all, delete-orphan")
    travel_styles = relationship("UserTravelStyle", back_populates="profile", cascade="all, delete-orphan")
