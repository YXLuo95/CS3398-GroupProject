# src/api/fitness.py
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

# importing dependencies for database session management and user authentication
from src.core.database import get_session
from src.core.auth import get_current_user
from src.model import User

# importing Pydantic schemas for request validation and response formatting, as well as CRUD functions for fitness records
from src.schemas import FitnessRecordCreate, FitnessRecordRead
from src.crud.fitness import create_fitness_record, get_user_fitness_records

router = APIRouter()

@router.post("/records", response_model=FitnessRecordRead, status_code=status.HTTP_201_CREATED)
async def add_fitness_record(
    record_in: FitnessRecordCreate,
    current_user: User = Depends(get_current_user), # fastAPI's dependency injection to get the currently authenticated user
    session: AsyncSession = Depends(get_session)
):
    """
    Submit new fitness data for the current user. The endpoint accepts a JSON payload containing the fitness data,
    validates it against the FitnessRecordCreate schema, and then creates a new FitnessRecord in the database associated with the current user.
    """
    # call the create_fitness_record function from the fitness CRUD module, 
    # passing in the database session, the validated input data, and the current user's ID to create a new fitness record in the database. The created record is returned as the response.
    return await create_fitness_record(session, record_in, current_user.id)


@router.get("/records", response_model=List[FitnessRecordRead])
async def read_fitness_records(
    limit: int = 5,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    retrieve a list of recent fitness records for the current user. 
    """
    return await get_user_fitness_records(session, current_user.id, limit)