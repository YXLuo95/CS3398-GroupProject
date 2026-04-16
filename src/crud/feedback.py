# from typing import List
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlmodel import select
# from src.model import UserFeedback

# async def create_feedback(session: AsyncSession, feedback: UserFeedback) -> UserFeedback:
#     session.add(feedback)
#     await session.commit()
#     await session.refresh(feedback)
#     return feedback

# async def get_feedback_by_user(session: AsyncSession, user_id: int) -> List[UserFeedback]:
#     statement = select(UserFeedback).where(UserFeedback.user_id == user_id).order_by(UserFeedback.created_at.desc())
#     result = await session.execute(statement)
#     return result.scalars().all()