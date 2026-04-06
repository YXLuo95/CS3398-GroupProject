from datetime import timedelta, datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

# new imports for password reset
from fastapi import Request                       # Request
from jose import JWTError, jwt                    # JWT decoding

# import core components and schemas
from src.core.database import get_session
from src.core.config import settings
from src.core.auth import create_access_token
from src.schemas import Token, UserCreate, UserRead
# new imports for password reset    
from src.core.auth import create_reset_token, blacklist_token, is_token_blacklisted
from src.schemas import PasswordResetRequest, PasswordResetConfirm

# import CRUD operations (keep them at the top for clarity)
from src.crud.user import (
    authenticate_user, 
    create_user, 
    get_user_by_username, 
    get_user_by_email,
    update_user_password
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
    request: Request,
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
    access_token = create_access_token(
        subject=user.username, expires_delta=access_token_expires
    )

    # save the active token in Redis with an expiration time, 
    # which allows us to manage active sessions and implement token revocation when users log out or when we want to invalidate tokens for security reasons.
    redis = request.app.state.redis_auth
    await redis.set(
        f"active_token:{user.username}",
        access_token,
        ex=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    return {"access_token": access_token, "token_type": "bearer"}

   
# reset password request handler
# 3. Forgot Password
@router.post("/forgot-password")
async def forgot_password(
    reset_req: PasswordResetRequest,
    session: AsyncSession = Depends(get_session),
):
    user = await get_user_by_username(session, reset_req.username)

    if not user or user.email != reset_req.email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No matching account found.",
        )

    reset_token = create_reset_token(subject=user.username)

    return {
        "message": "Password reset token generated.",
        "reset_token": reset_token,
    }


# 4. Reset Password
@router.post("/reset-password")
async def reset_password(
    reset_data: PasswordResetConfirm,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    try:
        payload = jwt.decode(
            reset_data.token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        username: str = payload.get("sub")
        token_type: str = payload.get("type")

        if username is None or token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid token.")

    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token.")

    if await is_token_blacklisted(request, reset_data.token):
        raise HTTPException(status_code=400, detail="Token has already been used.")

    user = await get_user_by_username(session, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    await update_user_password(session, user, reset_data.new_password)

    # blacklist the reset token to prevent reuse
    redis = request.app.state.redis_auth
    old_token = await redis.get(f"active_token:{username}")
    if old_token:
        await redis.setex(
            f"blacklist:{old_token}",
            settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "1"
        )
        await redis.delete(f"active_token:{username}")

    # blacklist the reset token itself
    exp = payload.get("exp")
    ttl = int(exp - datetime.now(timezone.utc).timestamp())
    if ttl > 0:
        await blacklist_token(request, reset_data.token, ttl)

    return {"message": "Password has been reset successfully."}