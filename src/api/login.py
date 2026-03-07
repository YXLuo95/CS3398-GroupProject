from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

# import core components and schemas
from src.core.database import get_session
from src.core.config import settings
from src.core.auth import create_access_token
from src.schemas import Token, UserCreate, UserRead

# import CRUD operations (keep them at the top for clarity)
from src.crud.user import (
    authenticate_user, 
    create_user, 
    get_user_by_username, 
    get_user_by_email
)

router = APIRouter()

# 1. Registration request handler
@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, session: AsyncSession = Depends(get_session)):
    # check for duplicates: whether the username or email already exists
    if await get_user_by_username(session, user_in.username) or \
       await get_user_by_email(session, user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="User already exists."
        )

    
    new_user = await create_user(session, user_in)
    return new_user

# 2. Login request handler
@router.post("/login/access-token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_session)
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = await authenticate_user(session, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # check if the user account is active
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    # token generation
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            subject=user.username, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }