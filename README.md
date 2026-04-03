# Blue Falcons Fitness App

A personalized fitness guide web app with user accounts, onboarding quiz, fitness tracking, and optional LLM-generated reports.

## Project Structure

```
cs3398-groupproject/
├── docs/
│   ├── project-management-plan.md
│   └── ERdiagram_sprint1.png
├── src/
│   ├── api/           # API endpoints (login, fitness, report, quiz, admin)
│   ├── core/          # Config, auth, database, security, health calculations
│   ├── crud/          # Database operations (user, fitness, quiz)
│   ├── model.py       # SQLModel database models
│   ├── schemas.py     # Pydantic request/response schemas
│   └── tasks.py       # Background LLM queue worker
├── src/frontend/      # React + Vite SPA
├── main.py            # FastAPI app entry point
├── requirements.txt
└── .env               # Create this (see Environment Variables)
```

## Technology Stack

- **Backend:** Python, FastAPI (async)
- **Database:** SQLite (async via aiosqlite) + SQLModel
- **Auth:** JWT (python-jose), password hashing (passlib/bcrypt), Redis (sessions/queue)
- **LLM (optional):** Ollama for local AI fitness reports
- **Frontend:** React 19, Vite 7, React Router
- **API docs:** FastAPI OpenAPI — `/docs`
- **Admin:** SQLAdmin — `/admin`

---

## Setup

### Backend

1. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   # Activate:
   # Windows:  venv\Scripts\activate
   # Mac/Linux: source venv/bin/activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the project root (see **Environment Variables** below).

4. **Redis** must be running. Quick start with Docker:

   ```bash
   docker run -d -p 6379:6379 redis:alpine
   ```

5. **(Optional) Ollama** — only needed for real AI reports. Install from [ollama.com](https://ollama.com), then e.g. `ollama run mistral-nemo`. If disabled in `.env`, the app uses a mock report generator.

### Frontend

```bash
cd src/frontend
npm install
npm run dev
```

Runs the app at `http://localhost:5173` (or the port Vite reports). Point it at the backend URL (e.g. `http://localhost:8000`) when you wire API calls.

---

## Environment Variables

Create a `.env` file in the **project root** (next to `main.py`):

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | Secret for JWT signing (use a long random string) |
| `ALGORITHM` | No | JWT algorithm (default: `HS256`) |
| `PROJECT_NAME` | No | App title (default: Fitness Advice and Tracking Service) |
| `REDIS_HOST` | No | Redis host (default: `localhost`) |
| `REDIS_PORT` | No | Redis port (default: `6379`) |
| `REDIS_PASSWORD` | No | Redis password (default: none) |
| `REDIS_DB_AUTH` | No | Redis DB for auth (default: `0`) |
| `REDIS_DB_QUEUE` | No | Redis DB for report queue (default: `2`) |
| `ENABLE_LLM_MODEL` | No | Set to `true` to use Ollama; `false` for mock reports (default: `true`) |
| `LOCAL_MODEL_NAME` | No | Ollama model name, e.g. `llama3` or `mistral-nemo` (default: `llama3`) |
| `OLLAMA_HOST` | No | Ollama server URL (default: `http://localhost:11434`) |
| `ADMIN_PASSWORD` | No | Admin panel password (default: `admin123`) |

**Minimal `.env` example:**

```env
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB_AUTH=0
REDIS_DB_QUEUE=2
ENABLE_LLM_MODEL=false
LOCAL_MODEL_NAME=mistral-nemo
OLLAMA_HOST=http://localhost:11434
ADMIN_PASSWORD=admin123
```

---

## Run

**Start the backend:**

```bash
python main.py
```

Server runs at `http://localhost:8000`.

**Start the frontend (separate terminal):**

```bash
cd src/frontend && npm run dev
```

---

## Documentation & Links

- **API (Swagger UI):** http://localhost:8000/docs  
- **Admin panel:** http://localhost:8000/admin  
- **Health check:** http://localhost:8000/health  
- **Project docs:** [Project Management Plan](docs/project-management-plan.md) · [Requirements](docs/requirements-specification.md) · [Architecture](docs/architecture.md) · [Test Plan](docs/test-plan.md)  
- **API docs:** Served by FastAPI at http://localhost:8000/docs (Swagger) and `/openapi.json`

---

## Version Control & Project Management

- **Version control:** Git + Bitbucket  
- **Project management:** Jira  
