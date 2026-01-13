from __future__ import annotations

from backend.settings import settings


def build_qr_url(session: str, size: int = 220) -> str:
    base_url = settings.whatsapp_qr_service_url.rstrip("/")
    data = f"https://web.whatsapp.com/qr/{session}"
    return f"{base_url}/?size={size}x{size}&data={data}"
