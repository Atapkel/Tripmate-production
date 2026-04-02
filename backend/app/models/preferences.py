from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import relationship

from app.core.database import Base


# --- Interest ---

class Interest(Base):
    __tablename__ = "interests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)

    user_interests = relationship("UserInterest", back_populates="interest")


class UserInterest(Base):
    __tablename__ = "user_interests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"))
    interest_id = Column(Integer, ForeignKey("interests.id", ondelete="CASCADE"))

    profile = relationship("Profile", back_populates="interests")
    interest = relationship("Interest", back_populates="user_interests")

    __table_args__ = (
        UniqueConstraint("profile_id", "interest_id", name="unique_user_interest"),
    )


# --- Language ---

class Language(Base):
    __tablename__ = "languages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=func.now())

    user_languages = relationship("UserLanguage", back_populates="language")


class UserLanguage(Base):
    __tablename__ = "user_languages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"))
    language_id = Column(Integer, ForeignKey("languages.id", ondelete="CASCADE"))

    profile = relationship("Profile", back_populates="languages")
    language = relationship("Language", back_populates="user_languages")

    __table_args__ = (
        UniqueConstraint("profile_id", "language_id", name="unique_user_language"),
        Index("idx_profile_languages", "profile_id"),
        Index("idx_language_profiles", "language_id"),
    )


# --- Travel Style ---

class TravelStyle(Base):
    __tablename__ = "travel_styles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=func.now())

    user_travel_styles = relationship("UserTravelStyle", back_populates="travel_style")


class UserTravelStyle(Base):
    __tablename__ = "user_travel_styles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"))
    travel_style_id = Column(Integer, ForeignKey("travel_styles.id", ondelete="CASCADE"))

    profile = relationship("Profile", back_populates="travel_styles")
    travel_style = relationship("TravelStyle", back_populates="user_travel_styles")

    __table_args__ = (
        UniqueConstraint("profile_id", "travel_style_id", name="unique_user_travel_style"),
        Index("idx_profile_travel_styles", "profile_id"),
        Index("idx_travel_style_profiles", "travel_style_id"),
    )
