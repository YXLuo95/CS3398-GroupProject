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

## Setup

```bash
# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt
```

## Run

Start the backend server:

```bash
uvicorn src.main:app --reload
```

## API Docs

http://localhost:8000/docs

## Documentation

- [Project Management Plan](docs/project-management-plan.md)