import logging
from typing import Any

from fastapi import FastAPI, HTTPException, Request, status

from backend.schemas import OutboundMessageRequest, OutboundMessageResponse, WebhookMessage
from backend.services.gupshup import GupshupError, send_text_message
from backend.services.n8n import N8nError, trigger_workflow
from backend.services.supabase import insert_message

logger = logging.getLogger("kamba.api")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Kamba CRM API", version="0.1.0")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/messages/send", response_model=OutboundMessageResponse)
async def send_message(request: OutboundMessageRequest) -> OutboundMessageResponse:
    try:
        response = await send_text_message(
            destination=request.to,
            text=request.text,
            source=request.source,
            metadata=request.metadata,
        )
    except GupshupError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    provider_id = response.get("messageId") or response.get("message_id")

    await insert_message(
        {
            "direction": "outbound",
            "channel": "whatsapp",
            "to": request.to,
            "text": request.text,
            "provider_message_id": provider_id,
            "metadata": request.metadata,
        }
    )

    return OutboundMessageResponse(provider_message_id=provider_id, status="queued")


@app.post("/api/gupshup/webhook")
async def gupshup_webhook(request: Request) -> dict[str, Any]:
    payload = await request.json()
    message = WebhookMessage(payload=payload)

    await insert_message(
        {
            "direction": "inbound",
            "channel": "whatsapp",
            "payload": message.payload,
            "received_at": message.received_at.isoformat(),
        }
    )

    try:
        await trigger_workflow({"source": "gupshup", "payload": message.payload})
    except N8nError as exc:
        logger.warning("Falha ao acionar n8n: %s", exc)

    return {"status": "received"}
