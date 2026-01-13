# saas_codex_gpt_vscode

## Backend (FastAPI)

Este backend integra Gupshup (WhatsApp), n8n e Supabase para registrar mensagens e acionar fluxos.

### Configuração
1. Copie `.env.example` para `.env` e preencha as credenciais.
2. Instale dependências:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r backend/requirements.txt
   ```
3. Execute a API:
   ```bash
   uvicorn backend.main:app --reload --port 8001
   ```

### Endpoints principais
- `POST /api/messages/send` envia mensagens pelo Gupshup.
- `POST /api/gupshup/webhook` recebe eventos do Gupshup e dispara n8n.
- `GET /health` verificação simples.
