#tokenlize authentication
#notes: security featurtes for the project

#notes: libs for time control
#token should have an expiration time, 
# and we need to handle token generation and verification,
from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Any

#lib for tokenlizeation
from jose import JWTError, jwt

#libs from fastApi
#notes: using FastAPI's OAuth2PasswordBearer to handle token-based authentication,
# which will allow us to secure our API endpoints and ensure that only authorized users can access the OCR services.
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

#libs that support behavior like acessing db
from sqlalchemy.ext.asyncio import AsyncSession
#db session dependency
from src.core.database import get_session
from src.core.config import settings

#libs for user management and token payload
from pydantic import ValidationError
from src.crud.user import get_user_by_username
from src.model import User
from src.schemas import TokenPayload

## oauth2 scheme for token-based authentication, which will be used to extract the token from the Authorization header of incoming requests.
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token" 
    if hasattr(settings, "API_V1_STR") else "/login/access-token"
)


#token generation and verification

def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Funtion: create_access_token is responsible for generating a JWT access token for a given subject (usually a user ID or username) with an optional expiration time.
    Parameters: 
        subject: The unique identifier for the user (e.g., username or user ID).
        expires_delta: Optional timedelta for custom expiration time. If not provided, it defaults to the value specified in the settings (ACCESS_TOKEN_EXPIRE_MINUTES).
    """
    #set expiration time, or use .env default value (30 minutes)
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    #prepare payload
    #IAW JWT standard
    to_encode = {"exp": expire, "sub": str(subject)}
    
    # use the secret key in the .evn to sign the token
    # the token will be encoded using the specified algorithm (HS256 in this case) and returned as a string.
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


#token verification
# this function will be used as a dependency in the API endpoints that require authentication,
# it will automatically extract the token from the request, verify it, and return the current user
async def get_current_user(
    token: str = Depends(oauth2_scheme), # fastAPI have built-in support for extracting the token from the Authorization header using the OAuth2PasswordBearer dependency,
    session: AsyncSession = Depends(get_session) 
) -> User:
    """
    Funtion: get_current_user is responsible for verifying the JWT access token provided in the request and retrieving the corresponding user from the database.
    Parameters:
    token: The JWT access token extracted from the Authorization header of the incoming request.
    session: The database session dependency.
    """
    
    # define a common exception for any authentication failure, which will be raised whenever the token is invalid, 
    # expired, or if the user does not exist in the database. This helps to keep the code clean and consistent when handling authentication errors.
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. decode the token using the secret key and algorithm specified in the .evn file,
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        # 2. extract the username (or user ID) from the "sub" claim in the token payload,
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
            
        # 3. validate the token payload using the TokenPayload schema, 
        # which will ensure that the token has the expected structure and data types.
        token_data = TokenPayload(sub=username)
        
    except (JWTError, ValidationError):
        #thorw the same credentials_exception for any error during token decoding or validation,
        raise credentials_exception
        
    # query the database to get the user object corresponding to the username extracted from the token,
    user = await get_user_by_username(session, username=token_data.sub)
    
    if user is None:
        #thorw the same credentials_exception if the user does not exist in the database,
        raise credentials_exception
        
    # if everything is valid, return the user object, which can then be used in the API endpoint to access user-specific information or perform authorization checks.
    return user