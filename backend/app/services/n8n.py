import httpx

from app.config import settings


class N8nClient:
    def ensure_configured(self) -> None:
        if not settings.n8n_webhook_url:
            raise ValueError("Configuração n8n ausente: N8N_WEBHOOK_URL")

    async def trigger_workflow(self, payload: dict) -> dict:
        self.ensure_configured()
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(settings.n8n_webhook_url, json=payload)
        if response.status_code >= 400:
            raise RuntimeError(
                f"Erro ao acionar n8n: {response.status_code} {response.text}"
            )
        if response.content:
            return response.json()
        return {"status": "accepted"}
