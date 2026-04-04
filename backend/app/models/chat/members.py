from sqlalchemy import Column, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class ChatMember(Base):
    __tablename__ = "chat_members"

    id = Column(Integer, primary_key=True, autoincrement=True)
    chat_group_id = Column(Integer, ForeignKey("chat_groups.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    joined_at = Column(DateTime, default=func.now(), nullable=False)
    last_read_message_id = Column(
        Integer, ForeignKey("messages.id", ondelete="SET NULL"), nullable=True
    )
    trip_removal_seen_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    chat_group = relationship("ChatGroup", back_populates="members")
    user = relationship("User", back_populates="chat_memberships")
