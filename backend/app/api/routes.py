from fastapi import APIRouter, HTTPException

from app.config import HealthStatus, settings
from app.models.messages import (
    InboundMessageRequest,
    MessageResponse,
    OutboundMessageRequest,
)
from app.services.gupshup import GupshupClient
from app.services.n8n import N8nClient
from app.services.supabase_client import SupabaseService

router = APIRouter()

gupshup_client = GupshupClient(settings.gupshup_api_base)
n8n_client = N8nClient()
supabase_service = SupabaseService()


@router.get("/health", response_model=HealthStatus)
async def health_check() -> HealthStatus:
    return HealthStatus(status="ok", environment=settings.environment)


@router.post("/messages/send", response_model=MessageResponse)
async def send_message(payload: OutboundMessageRequest) -> MessageResponse:
    try:
        provider = await gupshup_client.send_message(payload.to, payload.message)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    try:
        supabase_service.insert_message(
            {
                "direction": "outbound",
                "to": payload.to,
                "message": payload.message,
                "channel": payload.channel,
                "provider_message_id": provider.get("message_id"),
            }
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return MessageResponse(
        status=provider.get("status") or "submitted",
        provider_message_id=provider.get("message_id"),
    )


@router.post("/messages/inbound", response_model=MessageResponse)
async def record_inbound(payload: InboundMessageRequest) -> MessageResponse:
    try:
        supabase_service.insert_message(
            {
                "direction": "inbound",
                "from": payload.from_number,
                "message": payload.message,
                "channel": payload.channel,
                "received_at": payload.timestamp,
            }
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return MessageResponse(status="stored")


@router.post("/automation/trigger")
async def trigger_automation(payload: dict) -> dict:
    try:
        response = await n8n_client.trigger_workflow(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return response
