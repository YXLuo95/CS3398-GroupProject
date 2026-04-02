# main.py
import json
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from src.crud import quiz
import uvicorn
import redis.asyncio as aioredis 

from src.core.config import settings
from sqlmodel import SQLModel
from src.core.database import engine
from src.model import User, FitnessRecord, FitnessReport
from src.tasks import llm_queue_worker

logger = logging.getLogger("uvicorn.info")

# ==========================================
# Mock LLM service for testing without actual LLM integration
# ==========================================
async def mock_generate_report(*args, **kwargs):
    await asyncio.sleep(2) #give it some delay to simulate processing time
    return "LLM Disabled: This is a mock fitness report. Enable LLM in settings to get real reports."

class MockLLMService:
    def is_ready(self): return True

# ==========================================
# FastAPI Lifespan (Startup & Shutdown)
# ==========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("[Booting] Server starting...")

    # 1. Database Initialization
    try:
        logger.info("[Booting] Initializing Database...")
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        logger.info("[Booting] Database initialized.")
    except Exception as e:
        logger.error(f"[Booting] Database failed: {e}")
        raise e

    # 2. Redis Connection Setup
    try:
        logger.info(f" [Booting] Connecting to Async Redis...")
        app.state.redis_auth = aioredis.from_url(
            f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB_AUTH}",
            password=settings.REDIS_PASSWORD,
            decode_responses=True
        )
        app.state.redis_queue = aioredis.from_url(
            f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB_QUEUE}",
            password=settings.REDIS_PASSWORD,
            decode_responses=True
        )
        
        await app.state.redis_auth.ping()
        await app.state.redis_queue.ping()



        
        logger.info("[Booting] Async Redis connected (Auth & Queue).")
    except Exception as e:
        logger.error(f"[Booting] Redis failed: {e}")
        raise e

    # 3. LLM Engine Initialization (Dynamic Binding)
    app.state.llm_service = MockLLMService()
    app.state.generate_report = mock_generate_report # bind to the mock function by default
    
    if settings.ENABLE_LLM_MODEL:
        try:
            logger.info(f"[Booting] Checking Local LLM Model ({settings.LOCAL_MODEL_NAME})...")
            import ollama
            from src.core.llm import generate_fitness_report
            
            client = ollama.AsyncClient(host=settings.OLLAMA_HOST)
            await client.list() 
            
            # replace the mock function with the real LLM function for the worker to call
            app.state.generate_report = generate_fitness_report
            logger.info(f"[Booting] LLM Engine ({settings.LOCAL_MODEL_NAME}) is online and ready!")
            
        except ImportError:
            logger.error("[Booting] Dependency missing: ollama. Falling back to Mock.")
        except Exception as e:
            logger.error(f"[Booting] LLM Engine is offline or failed to connect: {e}. Falling back to Mock.")
    else:
        logger.info("[Booting] LLM disabled by settings. Using Mock mode.")

    # 4. Start the Exclusive Background Worker
    app.state.worker_task = asyncio.create_task(llm_queue_worker(app))

    yield 

    # 5. Graceful Shutdown
    logger.info("[Shutdown] Cleaning up...")
    if hasattr(app.state, 'worker_task'):
        app.state.worker_task.cancel()
        try:
            await app.state.worker_task
        except asyncio.CancelledError:
            pass

    if hasattr(app.state, 'redis_auth'):
        await app.state.redis_auth.aclose() 
    if hasattr(app.state, 'redis_queue'):
        await app.state.redis_queue.aclose() 
        
    logger.info("[Shutdown] Server shutdown complete.")

# ==========================================
# App Initialization & Routing
# ==========================================
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Fitness tracking and LLM-based advice generation system",
    version="1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", 
                   "http://127.0.0.1:5173",
                   "https://www.bluefalconfitness.com", 
                    "https://bluefalconfitness.com", 
                    "http://localhost:5173"],      
    allow_credentials=True,   
    allow_methods=["*"],      
    allow_headers=["*"],      
)

@app.get("/health")
async def health_check():
    llm_status = "disabled"
    if hasattr(app.state, "llm_service"):
        try:
            llm_status = "ready" if app.state.llm_service.is_ready() else "not_ready"
        except Exception:
            llm_status = "error"
    return {"status": "online", "llm": llm_status, "message": "Server is running."}

from src.api.login import router as login_router
app.include_router(login_router, prefix=settings.API_V1_STR, tags=["Authentication"])

from src.api.fitness import router as fitness_router
app.include_router(fitness_router, prefix=settings.API_V1_STR, tags=["Fitness"])

from src.api.report import router as report_router
app.include_router(report_router, prefix=f"{settings.API_V1_STR}/reports", tags=["AI Reports"])

from src.api.admin import setup_admin
setup_admin(app, engine)

from src.api.quiz import router as quiz_router
app.include_router(quiz_router, prefix="/api/v1/onboarding", tags=["onboarding"])

from src.api.profile import router as profile_router
app.include_router(profile_router, prefix=settings.API_V1_STR, tags=["User Profile"])

from src.api.chat import router as chat_router
app.include_router(chat_router, prefix=settings.API_V1_STR, tags=["Chat"])

from src.api.workout import router as workout_router
app.include_router(workout_router, prefix="/api/v1/workout", tags=["Workout"])


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)