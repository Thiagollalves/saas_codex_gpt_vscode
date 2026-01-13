from datetime import datetime
from pydantic import BaseModel, Field


class OutboundMessageRequest(BaseModel):
    to: str = Field(..., min_length=6)
    message: str = Field(..., min_length=1, max_length=4096)
    channel: str = Field(default="whatsapp")


class InboundMessageRequest(BaseModel):
    from_number: str = Field(..., min_length=6)
    message: str = Field(..., min_length=1, max_length=4096)
    channel: str = Field(default="whatsapp")
    timestamp: datetime | None = None


class MessageResponse(BaseModel):
    status: str
    provider_message_id: str | None = None
    detail: str | None = None
