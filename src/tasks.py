import asyncio
import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.database import engine
from src.model import FitnessReport

logger = logging.getLogger("Worker")

async def llm_queue_worker(app):
    """
    Exclusive background worker that consumes tasks from Redis.
    Ensures that only one LLM inference runs at a time on the GPU.
    """
    logger.info("[Worker] Dedicated background worker started.")
    while True:
        try:
            # BLPOP blocks until a task is available
            task_data = await app.state.redis_queue.blpop("fitness_report_queue", timeout=0)
            
            if task_data:
                _, message = task_data
                data = json.loads(message)
                
                user_id = data.get('user_id')
                logger.info(f"[Worker] Processing report for user_id: {user_id}")
                
                # Execute the inference
                report_content = await app.state.generate_report(
                    user_age=data.get('age'),
                    gender=data.get('gender'),
                    data_summary=data.get('summary')
                )
                
                # Save the generated report to the Database
                try:
                    async with AsyncSession(engine) as session:
                        new_report = FitnessReport(
                            user_id=user_id,
                            report_content=report_content,
                            data_summary=data.get('summary'),
                            model_used=settings.LOCAL_MODEL_NAME if settings.ENABLE_LLM_MODEL else "Mock Model"
                        )
                        
                        session.add(new_report)
                        await session.commit()
                        await session.refresh(new_report) 
                        
                        logger.info(f"[Worker] Task finished & saved to DB for user_id: {user_id} (Report ID: {new_report.id})")
                
                except Exception as db_err:
                    logger.error(f"[Worker Error] Failed to save report to DB for user_id {user_id}: {db_err}")

        except asyncio.CancelledError:
            logger.info("[Worker] Worker task is being safely cancelled...")
            break  # clean exit on cancellation
        except Exception as e:
            logger.error(f"[Worker Error] Unexpected error in worker: {e}")
            await asyncio.sleep(5)  # wait before retrying to avoid tight error loops