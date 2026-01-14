import logging
from typing import Any
from urllib.parse import quote
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request, status

from backend.schemas import OutboundMessageRequest, OutboundMessageResponse, WebhookMessage
from backend.services.gupshup import GupshupError, send_text_message
from backend.services.n8n import N8nError, trigger_workflow
from backend.services.supabase import insert_message

logger = logging.getLogger("kamba.api")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Kamba CRM API", version="0.1.0")
qr_sessions: dict[str, dict[str, Any]] = {}


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/whatsapp/qr")
async def generate_whatsapp_qr(token: str | None = None) -> dict[str, str]:
    session_id = uuid4().hex
    qr_token = token or session_id
    qr_url = (
        "https://api.qrserver.com/v1/create-qr-code/"
        f"?size=240x240&data={quote(qr_token)}"
    )
    qr_sessions[session_id] = {"status": "pending", "token": qr_token}
    return {"session_id": session_id, "qr_url": qr_url, "status": "pending"}


@app.get("/api/whatsapp/qr/status")
async def whatsapp_qr_status(session_id: str, mark: str | None = None) -> dict[str, str]:
    session = qr_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sessão não encontrada.")
    if mark == "connected":
        session["status"] = "connected"
    return {"session_id": session_id, "status": session["status"]}


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
