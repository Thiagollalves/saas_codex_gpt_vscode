from __future__ import annotations

import asyncio
from typing import Any

from supabase import Client, create_client

from backend.settings import settings

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client:
        return _client
    if not settings.supabase_url or not settings.supabase_service_key:
        raise RuntimeError("Supabase não configurado.")
    _client = create_client(settings.supabase_url, settings.supabase_service_key)
    return _client


async def insert_message(record: dict[str, Any]) -> dict[str, Any]:
    client = get_client()

    def _insert() -> dict[str, Any]:
        response = (
            client.schema(settings.supabase_schema)
            .table(settings.supabase_table_messages)
            .insert(record)
            .execute()
        )
        return response.data[0] if response.data else {}

    return await asyncio.to_thread(_insert)
