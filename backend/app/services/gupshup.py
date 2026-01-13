import httpx

from app.config import settings


class GupshupClient:
    def __init__(self, base_url: str) -> None:
        self._base_url = base_url.rstrip("/")

    def _headers(self) -> dict[str, str]:
        if not settings.gupshup_api_key:
            return {}
        return {"apikey": settings.gupshup_api_key}

    def ensure_configured(self) -> None:
        missing = []
        if not settings.gupshup_api_key:
            missing.append("GUPSHUP_API_KEY")
        if not settings.gupshup_app_name:
            missing.append("GUPSHUP_APP_NAME")
        if missing:
            raise ValueError(
                "Configuração Gupshup ausente: " + ", ".join(missing)
            )

    async def send_message(self, to: str, message: str) -> dict[str, str | None]:
        self.ensure_configured()
        payload = {
            "channel": "whatsapp",
            "source": settings.gupshup_app_name,
            "destination": to,
            "message": message,
        }
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{self._base_url}/sm/api/v1/msg",
                headers=self._headers(),
                data=payload,
            )
        if response.status_code >= 400:
            raise RuntimeError(
                f"Erro ao enviar mensagem: {response.status_code} {response.text}"
            )
        data = response.json() if response.content else {}
        return {
            "status": data.get("status") or "submitted",
            "message_id": data.get("messageId") or data.get("message_id"),
        }
