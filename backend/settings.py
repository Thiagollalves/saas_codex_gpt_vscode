from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="KAMBA_", case_sensitive=False)

    gupshup_api_key: str | None = None
    gupshup_app_name: str | None = None
    gupshup_source_number: str | None = None
    gupshup_api_url: str = "https://api.gupshup.io/sm/api/v1/msg"

    n8n_webhook_url: str | None = None
    n8n_api_key: str | None = None

    supabase_url: str | None = None
    supabase_service_key: str | None = None
    supabase_schema: str = "public"
    supabase_table_messages: str = "messages"


settings = Settings()
