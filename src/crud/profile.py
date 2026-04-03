from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from src.model import UserProfile
from src.schemas import UserProfileCreate


async def get_profile_by_user_id(
    session: AsyncSession, 
    user_id: int
) -> Optional[UserProfile]:
    """
    Retrieve the user's PII profile by user_id.
    Returns None if the user has not created a profile yet.
    """
    statement = select(UserProfile).where(UserProfile.user_id == user_id)
    result = await session.execute(statement)
    return result.scalars().first()


async def create_profile(
    session: AsyncSession, 
    profile_in: UserProfileCreate, 
    user_id: int
) -> UserProfile:
    """
    Take user input PII data, create a new UserProfile in the database, 
    and return the created profile.
    """
    db_profile = UserProfile(
        **profile_in.model_dump(),
        user_id=user_id
    )

    session.add(db_profile)
    await session.commit()
    await session.refresh(db_profile)

    return db_profile


async def update_profile(
    session: AsyncSession, 
    profile: UserProfile, 
    profile_in: UserProfileCreate
) -> UserProfile:
    """
    Update an existing UserProfile with new PII data and return the updated profile.
    """
    for key, value in profile_in.model_dump().items():
        setattr(profile, key, value)

    session.add(profile)
    await session.commit()
    await session.refresh(profile)

    return profile