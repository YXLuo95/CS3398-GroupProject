# src/crud/fitness.py
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from src.model import FitnessRecord
from src.schemas import FitnessRecordCreate

async def create_fitness_record(
    session: AsyncSession, 
    record_in: FitnessRecordCreate, 
    user_id: int
) -> FitnessRecord:
    """
    take user input fitness data, create a new FitnessRecord in the database, and return the created record.
    """
    # create a new FitnessRecord instance using the input data and associate it with the user_id
    db_record = FitnessRecord(
        **record_in.model_dump(),
        user_id=user_id
    )
    
    session.add(db_record)
    await session.commit()
    await session.refresh(db_record)
    
    return db_record

async def get_user_fitness_records(
    session: AsyncSession, 
    user_id: int, 
    limit: int = 10
) -> List[FitnessRecord]:
    """
    method to retrieve a list of fitness records for a specific user, 
    ordered by creation time in descending order, and limited to a specified number of records.
    """
    #refer to the SQLModel documentation for constructing a select statement to query FitnessRecord 
    # entries based on user_id, ordered by created_at, and limited by the specified limit.
    statement = (
        select(FitnessRecord)
        .where(FitnessRecord.user_id == user_id)
        .order_by(FitnessRecord.created_at.desc())
        .limit(limit)
    )
    result = await session.execute(statement)
    return result.scalars().all()