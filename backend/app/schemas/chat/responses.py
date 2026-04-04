from datetime import datetime
from typing import Optional

from pydantic import BaseModel, model_validator


class ChatGroupResponse(BaseModel):
    id: int
    trip_vacancy_id: int
    name: str
    created_at: datetime
    updated_at: datetime
    unread_count: int = 0
    trip_status: Optional[str] = None

    class Config:
        from_attributes = True


class ChatMemberResponse(BaseModel):
    id: int
    chat_group_id: int
    user_id: int
    joined_at: datetime

    class Config:
        from_attributes = True


class ChatMessageResponse(BaseModel):
    id: int
    chat_group_id: int
    sender_id: Optional[int] = None
    sender_name: Optional[str] = None
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

    @model_validator(mode="before")
    @classmethod
    def extract_sender_name(cls, data):
        if hasattr(data, "sender") and data.sender:
            profile = getattr(data.sender, "profile", None)
            if profile:
                data.sender_name = f"{profile.first_name} {profile.last_name}"
        return data

    @model_validator(mode="after")
    def system_sender_label(self):
        if self.sender_id is None:
            object.__setattr__(self, "sender_name", self.sender_name or "TripMate")
        return self
