# saas_codex_gpt_vscode
## Backend (FastAPI)

### Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### Environment variables

```bash
export GUPSHUP_API_KEY=""
export GUPSHUP_APP_NAME=""
export GUPSHUP_API_BASE="https://api.gupshup.io"
export N8N_WEBHOOK_URL=""
export SUPABASE_URL=""
export SUPABASE_SERVICE_KEY=""
export SUPABASE_MESSAGES_TABLE="messages"
```

### Run

```bash
uvicorn app.main:app --reload --port 8001 --app-dir backend
```
