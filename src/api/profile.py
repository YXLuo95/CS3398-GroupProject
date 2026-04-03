from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_session
from src.core.auth import get_current_user
from src.model import User
from src.schemas import UserProfileCreate, UserProfileRead
from src.crud.profile import get_profile_by_user_id, create_profile, update_profile

router = APIRouter()


# GET /profile 
@router.get("/profile", response_model=UserProfileRead)
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    profile = await get_profile_by_user_id(session, current_user.id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )

    return UserProfileRead(
        username=current_user.username,
        email=current_user.email,
        **profile.dict(exclude={"id", "user_id", "user", "created_at", "updated_at"})
    )


# PUT /profile 
@router.put("/profile", response_model=UserProfileRead)
async def update_user_profile(
    data: UserProfileCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    profile = await get_profile_by_user_id(session, current_user.id)

    if profile:
        profile = await update_profile(session, profile, data)
    else:
        profile = await create_profile(session, data, current_user.id)

    return UserProfileRead(
        username=current_user.username,
        email=current_user.email,
        **profile.dict(exclude={"id", "user_id", "user", "created_at", "updated_at"})
    )