# src/api/report.py
import json
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

# importing dependencies for database session management and user authentication    
from src.core.database import get_session
from src.core.auth import get_current_user
from src.core.config import settings

# import db models (FitnessReport is removed from here as the worker will handle it)
from src.model import User, FitnessRecord

router = APIRouter()

# Changed status code to 202 ACCEPTED, standard for async queued tasks
@router.post("/generate", status_code=status.HTTP_202_ACCEPTED)
async def enqueue_fitness_report(
    request: Request, 
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Queue a fitness report generation task for the current user.
    This endpoint extracts recent data and delegates the heavy LLM inference to a Redis background worker.
    """
    
    # ==========================================
    # 1. Pre processing & Data Extraction
    # ==========================================
    statement = (
        select(FitnessRecord)
        .where(FitnessRecord.user_id == current_user.id)
        .order_by(FitnessRecord.created_at.desc())
        .limit(2) # pull 2 for now
    )
    result = await session.execute(statement)
    records = result.scalars().all()

    if not records:
        raise HTTPException(status_code=400, detail="No fitness records found. Please submit your data first.")
    
    latest_record = records[0]
    
    # calculate the user data summary (Imperial units)
    if len(records) == 1:
        data_summary = (
            f"Current baseline: Weight {latest_record.weight_lbs} pounds, Height {latest_record.height_in} inches. "
            f"Goal: {latest_record.fitness_goal}. Activity Level: {latest_record.activity_level}."
        )
    else:
        previous_record = records[1]
        weight_diff = latest_record.weight_lbs - previous_record.weight_lbs
        trend = "gained" if weight_diff > 0 else "lost"
        
        data_summary = (
            f"Current: Weight {latest_record.weight_lbs} pounds, Height {latest_record.height_in} inches. "
            f"Compared to previous record, the user has {trend} {abs(weight_diff):.1f} pounds. "
            f"Goal: {latest_record.fitness_goal}. Activity Level: {latest_record.activity_level}."
        )

    # ==========================================
    # 2. Push Task to Redis Queue (Producer)
    # ==========================================
    # Package all necessary parameters for the background worker
    task_payload = {
        "user_id": current_user.id,
        "age": latest_record.age,
        "gender": latest_record.gender,
        "summary": data_summary
    }
    
    try:
        # Push the task to the left side of the list (FIFO queue)
        await request.app.state.redis_queue.lpush(
            "fitness_report_queue", 
            json.dumps(task_payload)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to queue task in Redis: {str(e)}")

    # ==========================================
    # 3. Return Immediate Response
    # ==========================================
    # Do not wait for the LLM! Return to the user instantly.
    return {
        "message": "Fitness report generation queued successfully!",
        "status": "pending",
        "action_required": "Please check your report history in a few moments."
    }