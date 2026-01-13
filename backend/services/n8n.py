from typing import Any

import httpx

from backend.settings import settings


class N8nError(RuntimeError):
    pass


async def trigger_workflow(payload: dict[str, Any]) -> dict[str, Any]:
    if not settings.n8n_webhook_url:
        raise N8nError("Webhook do n8n não configurado.")

    headers = {}
    if settings.n8n_api_key:
        headers["X-N8N-API-KEY"] = settings.n8n_api_key

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(settings.n8n_webhook_url, json=payload, headers=headers)
        if response.status_code >= 400:
            raise N8nError(
                f"Erro ao chamar n8n: {response.status_code} - {response.text}"
            )
        try:
            return response.json()
        except ValueError:
            return {"status": "ok", "raw": response.text}
