# Import components
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
import redis.asyncio as aioredis  

#importing SQLModel and AsyncSession for defining database models and performing asynchronous database operations, respectively.
from src.core.config import settings
from sqlmodel import SQLModel
from src.core.database import engine

#importing models and schemas for user management, fitness records, and fitness reports, which will be used in the API routes and database operations.
from src.model import User, FitnessRecord, FitnessReport

# Configure the logging format
logger = logging.getLogger("uvicorn.info")

# ==========================================
# mock LLM service for testing without actual LLM integration
# ==========================================
def mock_generate_report(*args, **kwargs):
    return "LLM Disabled: This is a mock fitness report. Enable LLM in settings to get real reports."

class MockLLMService:
    def is_ready(self): return True

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
        
        # authentication-related Redis (0)
        app.state.redis_auth = aioredis.from_url(
            f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB_AUTH}",
            password=settings.REDIS_PASSWORD,
            decode_responses=True
        )
        
        # LLM-related Redis (1)
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

    # 3. LLM Engine Initialization 
    app.state.llm_service = MockLLMService()
    app.state.generate_report = mock_generate_report
    
    if settings.ENABLE_LLM_MODEL:
        try:
            logger.info(f"[Booting] Checking Local LLM Model ({settings.LOCAL_MODEL_NAME})...")
            
            from src.core.llm import generate_fitness_report
            app.state.generate_report = generate_fitness_report
            logger.info("[Booting] LLM Engine initialized and ready.")
        except ImportError:
            logger.error("[Booting] Dependency missing: ollama. Falling back to Mock.")
        except Exception as e:
            logger.error(f"[Booting] LLM Init failed: {e}. Falling back to Mock.")
    else:
        logger.info("[Booting] LLM disabled by settings. Using Mock mode.")

    yield 

    # 4. Graceful Shutdown
    logger.info("[Shutdown] Cleaning up...")
    if hasattr(app.state, 'redis_auth'):
        await app.state.redis_auth.aclose() 
    if hasattr(app.state, 'redis_queue'):
        await app.state.redis_queue.aclose() 
    logger.info("[Shutdown] Server shutdown complete.")


# Instantiate the app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Fitness tracking and LLM-based advice generation system",
    version="1.0",
    lifespan=lifespan
)

# CORS middleware configuration to allow cross-origin requests from any domain, which is useful for development and testing purposes, 
# but should be restricted in production environments for security reasons. The configuration allows all origins, credentials, methods, 
# and headers to ensure that the API can be accessed from various clients without CORS issues during development. 
# Per fastApi template, you can customize the allowed origins, methods, and headers as needed for your specific use case when deploying to production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      
    allow_credentials=True,   
    allow_methods=["*"],      
    allow_headers=["*"],      
)

# Health Check 
@app.get("/health")
async def health_check():
    llm_status = "disabled"
    if hasattr(app.state, "llm_service"):
        try:
            llm_status = "ready" if app.state.llm_service.is_ready() else "not_ready"
        except Exception:
            llm_status = "error"

    return {"status": "online", "llm": llm_status, "message": "Fitness Server is running."}

# loading API routes for authentication and fitness data management. The login_router is included for handling user authentication-related endpoints,
from src.api.login import router as login_router
app.include_router(login_router, tags=["Authentication"])

#api router for fitness related endpoints
from src.api.fitness import router as fitness_router
app.include_router(fitness_router, prefix=settings.API_V1_STR, tags=["Fitness"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)