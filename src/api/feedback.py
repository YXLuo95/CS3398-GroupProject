# from typing import List
# from fastapi import APIRouter, Depends, status
# from sqlalchemy.ext.asyncio import AsyncSession
# from src.core.database import get_session
# from src.core.auth import get_current_user
# from src.model import User, UserFeedback
# from src.schemas import FeedbackCreate, FeedbackRead
# from src.crud.feedback import create_feedback, get_feedback_by_user

# router = APIRouter()

# @router.post("", response_model=FeedbackRead, status_code=status.HTTP_201_CREATED)
# async def submit_feedback(
#     data: FeedbackCreate,
#     current_user: User = Depends(get_current_user),
#     session: AsyncSession = Depends(get_session),
# ):
#     feedback = UserFeedback(
#         user_id=current_user.id,
#         rating=data.rating,
#         comment=data.comment,
#     )
#     return await create_feedback(session, feedback)

# @router.get("", response_model=List[FeedbackRead])
# async def get_my_feedback(
#     current_user: User = Depends(get_current_user),
#     session: AsyncSession = Depends(get_session),
# ):
#     return await get_feedback_by_user(session, current_user.id)

