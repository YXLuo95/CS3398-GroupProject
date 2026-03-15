# AI Feature Development Guide: The Async Worker Pattern

This guide explains how to build AI-powered endpoints. 
Because LLM inference takes time (10-30 seconds), we **NEVER** wait for the AI inside the main FastAPI endpoint. Instead, we use a **Producer-Consumer pattern** with Redis.

---

## Core Concept: The "Restaurant" Analogy

1. **The Frontend (Customer):** Clicks "Generate Report".
2. **FastAPI (Waiter):** Takes the request, gathers the user's recent data, writes it on a ticket, and immediately says "Your order is in the kitchen!" (Returns HTTP 202).
3. **Redis (Order Rail):** Holds the ticket in a queue (`lpush`).
4. **AI Worker (Chef):** A separate background process takes the ticket from Redis, runs the heavy LLM inference, and saves the final report to the Database.
5. **The Frontend (Customer):** Polls the database later to see if the food (report) is ready.

---

## Implementation Template

When creating a new AI feature, use the following code structure as your standard template.

```python
import json
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import List

from src.core.database import get_session
from src.core.auth import get_current_user
from src.model import User, FitnessRecord, FitnessReport

router = APIRouter()

# Use 202 ACCEPTED because the process is queued, not completed.
@router.post("/generate", status_code=status.HTTP_202_ACCEPTED)
async def enqueue_fitness_report(
    request: Request, 
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Queue a task for the AI worker. 
    This endpoint ONLY prepares the context and pushes it to Redis.
    """
    
    # ==========================================
    # 1. Pre-processing & Context Extraction
    # ==========================================
    # The AI needs context. We pull the user's raw data from the DB.
    statement = (
        select(FitnessRecord)
        .where(FitnessRecord.user_id == current_user.id)
        .order_by(FitnessRecord.created_at.desc())
        .limit(2)
    )
    result = await session.execute(statement)
    records = result.scalars().all()

    if not records:
        raise HTTPException(
            status_code=400, 
            detail="No data found. Submit data before generating a report."
        )
    
    latest_record = records[0]
    
    # Format the data into a clean string for the LLM prompt later
    data_summary = f"Goal: {latest_record.fitness_goal}. Weight: {latest_record.weight_lbs} lbs."

    # ==========================================
    # 2. Push Task to Redis Queue (Producer)
    # ==========================================
    # Package everything the background worker needs into a dictionary
    task_payload = {
        "user_id": current_user.id,
        "age": latest_record.age,
        "summary": data_summary
    }
    
    try:
        # Serialize to JSON and push to the Redis list
        await request.app.state.redis_queue.lpush(
            "fitness_report_queue", 
            json.dumps(task_payload)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Redis error: {str(e)}")

    # ==========================================
    # 3. Return Immediate Response
    # ==========================================
    # Free up the API instantly so the UI remains responsive
    return {
        "message": "Generation queued successfully!",
        "status": "pending"
    }


# ==========================================
# 4. The Getter (How Frontend retrieves the result)
# ==========================================
@router.get("", response_model=List[FitnessReport])
async def get_my_reports(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    React calls this endpoint to fetch the finished reports 
    saved by the background AI worker.
    """
    statement = (
        select(FitnessReport)
        .where(FitnessReport.user_id == current_user.id)
        .order_by(FitnessReport.created_at.desc())
    )
    result = await session.execute(statement)
    return result.scalars().all()