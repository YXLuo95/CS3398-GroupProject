import asyncio
import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.database import engine
from src.model import FitnessReport, NutritionPlan

logger = logging.getLogger("Worker")


async def llm_queue_worker(app):
    """
    Exclusive background worker that consumes tasks from Redis.
    Listens on BOTH fitness_report_queue and nutrition_plan_queue.
    Ensures that only one LLM inference runs at a time on the GPU.
    """
    logger.info("[Worker] Dedicated background worker started. Listening on: fitness_report_queue, nutrition_plan_queue")

    while True:
        try:
            # BLPOP blocks until a task is available on EITHER queue.
            # Returns (queue_name, message) — queue_name tells us which task type it is.
            task_data = await app.state.redis_queue.blpop(
                ["fitness_report_queue", "nutrition_plan_queue"],
                timeout=0
            )

            if not task_data:
                continue

            queue_name, message = task_data
            data = json.loads(message)
            user_id = data.get('user_id')

            # ==========================================
            # Dispatch based on which queue the task came from
            # ==========================================
            if queue_name == "fitness_report_queue":
                await _process_fitness_report(app, data, user_id)

            elif queue_name == "nutrition_plan_queue":
                await _process_nutrition_plan(app, data, user_id)

            else:
                logger.warning(f"[Worker] Unknown queue: {queue_name}")

        except asyncio.CancelledError:
            logger.info("[Worker] Worker task is being safely cancelled...")
            break  # clean exit on cancellation
        except Exception as e:
            logger.error(f"[Worker Error] Unexpected error in worker: {e}")
            await asyncio.sleep(5)  # wait before retrying to avoid tight error loops


async def _process_fitness_report(app, data: dict, user_id: int):
    """Process a fitness report generation task."""
    logger.info(f"[Worker] Processing FITNESS REPORT for user_id: {user_id}")

    try:
        report_content = await app.state.generate_report(
            user_age=data.get('age'),
            gender=data.get('gender'),
            data_summary=data.get('summary')
        )

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

            logger.info(f"[Worker] Fitness report saved for user_id: {user_id} (ID: {new_report.id})")

    except Exception as e:
        logger.error(f"[Worker Error] Fitness report failed for user_id {user_id}: {e}")


async def _process_nutrition_plan(app, data: dict, user_id: int):
    """Process a nutrition plan generation task."""
    logger.info(f"[Worker] Processing NUTRITION PLAN for user_id: {user_id}")

    try:
        plan_content = await app.state.generate_nutrition_plan(
            data_summary=data.get('summary')
        )

        async with AsyncSession(engine) as session:
            new_plan = NutritionPlan(
                user_id=user_id,
                plan_content=plan_content,
                data_summary=data.get('summary'),
                calories=data.get('calories'),
                protein_g=data.get('protein_g'),
                fat_g=data.get('fat_g'),
                carbs_g=data.get('carbs_g'),
                model_used=settings.LOCAL_MODEL_NAME if settings.ENABLE_LLM_MODEL else "Mock Model"
            )
            session.add(new_plan)
            await session.commit()
            await session.refresh(new_plan)

            logger.info(f"[Worker] Nutrition plan saved for user_id: {user_id} (ID: {new_plan.id})")

    except Exception as e:
        logger.error(f"[Worker Error] Nutrition plan failed for user_id {user_id}: {e}")