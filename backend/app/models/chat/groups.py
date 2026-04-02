from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class ChatGroup(Base):
    __tablename__ = "chat_groups"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_vacancy_id = Column(
        Integer, ForeignKey("trip_vacancies.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    name = Column(String(255), nullable=False)

    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    trip_vacancy = relationship("TripVacancy", back_populates="chat_group")
    members = relationship("ChatMember", back_populates="chat_group", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="chat_group", cascade="all, delete-orphan")
