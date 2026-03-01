# src/api/report.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

# importing dependencies for database session management and user authentication    
from src.core.database import get_session
from src.core.auth import get_current_user
from src.core.config import settings

# import db model
from src.model import User, FitnessRecord, FitnessReport

router = APIRouter()

@router.post("/generate", status_code=status.HTTP_201_CREATED)
async def create_fitness_report(
    request: Request, # to access the app state where the LLM generation function is stored
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    generate a fitness report for the current user based on their recent fitness data. The endpoint performs the following steps:
    """
    
    # ==========================================
    # 1. Pre processing & Data Extraction
    # ==========================================
    statement = (
        select(FitnessRecord)
        .where(FitnessRecord.user_id == current_user.id)
        .order_by(FitnessRecord.created_at.desc())
        .limit(2) #pull 2 for now, 
    )
    result = await session.execute(statement)
    records = result.scalars().all()

    if not records:
        raise HTTPException(status_code=400, detail="No fitness records found. Please submit your data first.")
    
    latest_record = records[0]
    
    # calculate the user
    if len(records) == 1:
        data_summary = (
            f"Current baseline: Weight {latest_record.weight_kg}pound, Height {latest_record.height_cm}cm. "
            f"Goal: {latest_record.fitness_goal}. Activity Level: {latest_record.activity_level}."
        )
    else:
        previous_record = records[1]
        weight_diff = latest_record.weight_kg - previous_record.weight_kg
        trend = "gained" if weight_diff > 0 else "lost"
        
        data_summary = (
            f"Current: Weight {latest_record.weight_kg}kg, Height {latest_record.height_cm}cm. "
            f"Compared to previous record, the user has {trend} {abs(weight_diff):.1f}kg. "
            f"Goal: {latest_record.fitness_goal}. Activity Level: {latest_record.activity_level}."
        )

    # ==========================================
    # 2. generate report using LLM (Inference)
    # ==========================================
    # call the LLM generation function stored in the app state, passing in the extracted parameters
    generate_func = request.app.state.generate_report 
    
    # 传入提取好的参数，开始异步推理
    report_text = await generate_func(
        user_age=latest_record.age,
        gender=latest_record.gender,
        data_summary=data_summary
    )

    if not report_text:
        raise HTTPException(status_code=500, detail="Failed to generate report from LLM.")

    # ==========================================
    # 3. store the report
    # ==========================================
    new_report = FitnessReport(
        user_id=current_user.id,
        report_content=report_text,
        data_summary=data_summary, # save the data we used to prompt LLM for debugging and future reference
        model_used=settings.LOCAL_MODEL_NAME if settings.ENABLE_LLM_MODEL else "Mock Model"
    )
    
    session.add(new_report)
    await session.commit()
    await session.refresh(new_report)

    return {
        "message": "Report generated successfully!",
        "report_id": new_report.id,
        "model_used": new_report.model_used,
        "content": new_report.report_content
    }