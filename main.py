# Import components
import json
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import redis.asyncio as aioredis 

# Importing SQLModel and AsyncSession for defining database models and performing asynchronous database operations, respectively.
from src.core.config import settings
from sqlmodel import SQLModel
from src.core.database import engine

# Importing models and schemas for user management, fitness records, and fitness reports, which will be used in the API routes and database operations.
from src.model import User, FitnessRecord, FitnessReport

# Configure the logging format
logger = logging.getLogger("uvicorn.info")

# ==========================================
# Mock LLM service for testing without actual LLM integration
# ==========================================
def mock_generate_report(*args, **kwargs):
    return "LLM Disabled: This is a mock fitness report. Enable LLM in settings to get real reports."

class MockLLMService:
    def is_ready(self): return True

#to feed generated report to the database
from sqlalchemy.ext.asyncio import AsyncSession
async def llm_queue_worker(app: FastAPI):
    """
    Exclusive background worker that consumes tasks from Redis.
    Ensures that only one LLM inference runs at a time on the GPU.
    """
    logger.info("[Worker] 4070Ti dedicated worker started.")
    try:
        while True:
            # BLPOP blocks until a task is available in 'fitness_report_queue'
            # This implements a strict FIFO queue for the single GPU resource
            task_data = await app.state.redis_queue.blpop("fitness_report_queue", timeout=0)
            
            if task_data:
                _, message = task_data
                data = json.loads(message)
                
                logger.info(f"[Worker] Processing report for user_id: {data['user_id']}")
                
                # Execute the inference using the function stored in app state
                report_content = await app.state.generate_report(
                    user_age=data['age'],
                    gender=data['gender'],
                    data_summary=data['summary']
                )
                
                # ==========================================
                # Save the generated report to the Database
                # ==========================================
                # We must manually create an AsyncSession context here because 
                # background tasks do not have access to FastAPI's Depends() injection.
                try:
                    async with AsyncSession(engine) as session:
                        new_report = FitnessReport(
                            user_id=data['user_id'],
                            report_content=report_content,
                            data_summary=data['summary'],
                            model_used=settings.LOCAL_MODEL_NAME if settings.ENABLE_LLM_MODEL else "Mock Model"
                            # Note: analysis_start_date and analysis_end_date can be left as None 
                            # or populated here if you tracked the timestamps.
                        )
                        
                        session.add(new_report)
                        await session.commit()
                        await session.refresh(new_report) # Fetch the generated ID
                        
                    logger.info(f"[Worker] Task finished & saved to DB for user_id: {data['user_id']} (Report ID: {new_report.id})")
                
                except Exception as db_err:
                    logger.error(f"[Worker Error] Failed to save report to DB for user_id {data['user_id']}: {db_err}")
                
    except asyncio.CancelledError:
        # Clean exit when the server stops
        logger.info("[Worker] Worker task is being cancelled...")
    except Exception as e:
        logger.error(f"[Worker Error] Unexpected error in worker: {e}")
        await asyncio.sleep(5)  # brief pause before retrying to avoid tight error loops

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
        
        # Authentication-related Redis (0)
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
            
            # Importing the ollama client library and the generate_fitness_report function from the llm module.
            import ollama
            from src.core.llm import generate_fitness_report
            
            client = ollama.AsyncClient(host='http://localhost:11434')
            await client.list() # test connection and model availability by listing models, if this fails it will jump to the except block
            
            app.state.generate_report = generate_fitness_report
            logger.info(f"[Booting] LLM Engine ({settings.LOCAL_MODEL_NAME}) is online and ready!")
            
        except ImportError:
            logger.error("[Booting] Dependency missing: ollama. Falling back to Mock.")
        except Exception as e:
            logger.error(f"[Booting] LLM Engine is offline or failed to connect: {e}. Falling back to Mock.")
    else:
        logger.info("[Booting] LLM disabled by settings. Using Mock mode.")

    # 4. Start the Exclusive Background Worker
    # Run the worker as a background task to avoid blocking the main event loop
    app.state.worker_task = asyncio.create_task(llm_queue_worker(app))

    yield 

    # 5. Graceful Shutdown
    logger.info("[Shutdown] Cleaning up...")
    
    # Safely cancel the worker task
    if hasattr(app.state, 'worker_task'):
        app.state.worker_task.cancel()
        try:
            await app.state.worker_task
        except asyncio.CancelledError:
            pass

    # Close Redis connections
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
# Per FastAPI template, you can customize the allowed origins, methods, and headers as needed for your specific use case when deploying to production.
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

    return {"status": "online", "llm": llm_status, "message": "Server is running."}

# ==========================================
# API Routers Mounting
# ==========================================

# Loading API routes for authentication and fitness data management. 
# The login_router is included for handling user authentication-related endpoints,
from src.api.login import router as login_router
app.include_router(login_router,prefix=settings.API_V1_STR,tags=["Authentication"])

# API router for fitness related endpoints
from src.api.fitness import router as fitness_router
app.include_router(fitness_router, prefix=settings.API_V1_STR, tags=["Fitness"])

# API router for LLM report generation endpoints (CRITICAL FOR UI)
from src.api.report import router as report_router
app.include_router(report_router, prefix=f"{settings.API_V1_STR}/reports", tags=["AI Reports"])

# Admin Panel Mounting
from src.api.admin import setup_admin
from src.core.database import engine
setup_admin(app, engine)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)