from typing import Any

import httpx

from backend.settings import settings


class GupshupError(RuntimeError):
    pass


async def send_text_message(
    destination: str, text: str, source: str | None = None, metadata: dict[str, Any] | None = None
) -> dict[str, Any]:
    if not settings.gupshup_api_key or not settings.gupshup_app_name:
        raise GupshupError("Credenciais do Gupshup não configuradas.")

    payload = {
        "channel": "whatsapp",
        "source": source or settings.gupshup_source_number,
        "destination": destination,
        "message": {"type": "text", "text": text},
        "src.name": settings.gupshup_app_name,
    }

    if metadata:
        payload["metadata"] = metadata

    if not payload["source"]:
        raise GupshupError("Número de origem do Gupshup não configurado.")

    headers = {"apikey": settings.gupshup_api_key}

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(settings.gupshup_api_url, data=payload, headers=headers)
        if response.status_code >= 400:
            raise GupshupError(
                f"Erro ao enviar mensagem no Gupshup: {response.status_code} - {response.text}"
            )
        return response.json()
