# Blue Falcons Fitness App

A personalized fitness guide web app.

## Project Structure

```
cs3398-groupproject/
├── docs/
|   ├──pmp            # Project Management Plan
├── src/
│   ├── api/          # API endpoints
│   ├── core/         # Config, auth, database
│   ├── crud/         # Database operations
│   ├── model.py      # Database models
│   ├── schemas.py    # Request/response schemas
│   └── main.py       # App entry point
└── requirements.txt
```

## Technology Stack

- **Backend:** Python, FastAPI  
- **Database:** SQL-based database (TBD / implementation dependent)  
- **API Documentation:** FastAPI automatic OpenAPI docs  
- **Version Control:** Git + Bitbucket  
- **Project Management:** Jira  

---

## Setup

## Setup

Create and activate a virtual environment, then install dependencies.

```bash
# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt
```

## Environment Variables
Create a .env file in the root directory with the following content:

SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
PROJECT_NAME=FitnessAI

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB_AUTH=0
REDIS_DB_QUEUE=2

ENABLE_LLM_MODEL=FALSE
LOCAL_MODEL_NAME=mistral-nemo

## Dependencies

Redis: Must be active. You can start a local instance quickly via Docker:
docker run -d -p 6379:6379 redis:alpine

Ollama: Required for actual AI analysis. Install it from ollama.com.

## Run

Option A: Fully Local (With GPU and Ollama)
Ensure Ollama is running and the model is available: ollama run mistral-nemo

Start the FastAPI server:
python main.py

**API Documentation**
Once the server is running, visit:


http://localhost:8000/docs

## Documentation

- [Project Management Plan](docs/project-management-plan.md)

Interactive Docs (Swagger UI): http://localhost:8000/docs

Admin Panel: http://localhost:8000/admin

