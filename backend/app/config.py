from pydantic import BaseModel
from pydantic_settings import BaseSettings


class AppSettings(BaseSettings):
    app_name: str = "Kamba CRM Backend"
    environment: str = "development"

    gupshup_api_base: str = "https://api.gupshup.io"
    gupshup_app_name: str | None = None
    gupshup_api_key: str | None = None

    n8n_webhook_url: str | None = None

    supabase_url: str | None = None
    supabase_service_key: str | None = None
    supabase_messages_table: str = "messages"

    class Config:
        env_file = ".env"
        env_prefix = ""
        case_sensitive = False


class HealthStatus(BaseModel):
    status: str
    environment: str


settings = AppSettings()
