from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class OutboundMessageRequest(BaseModel):
    to: str = Field(..., min_length=5)
    text: str = Field(..., min_length=1, max_length=4096)
    source: str | None = None
    metadata: dict[str, Any] | None = None


class OutboundMessageResponse(BaseModel):
    provider_message_id: str | None = None
    status: str


class WebhookMessage(BaseModel):
    payload: dict[str, Any]
    received_at: datetime = Field(default_factory=datetime.utcnow)


class WhatsAppQrRequest(BaseModel):
    token: str | None = Field(default=None, min_length=3, max_length=120)


class WhatsAppQrResponse(BaseModel):
    qr_url: str
    session: str
    provider: str
