from supabase import Client, create_client

from app.config import settings


class SupabaseService:
    def __init__(self) -> None:
        self._client: Client | None = None

    def _get_client(self) -> Client:
        if self._client:
            return self._client
        if not settings.supabase_url or not settings.supabase_service_key:
            raise ValueError(
                "Configuração Supabase ausente: SUPABASE_URL e SUPABASE_SERVICE_KEY"
            )
        self._client = create_client(
            settings.supabase_url, settings.supabase_service_key
        )
        return self._client

    def insert_message(self, payload: dict) -> None:
        client = self._get_client()
        table = settings.supabase_messages_table
        response = client.table(table).insert(payload).execute()
        if response.error:
            raise RuntimeError(response.error.message)
