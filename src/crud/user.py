#define user crud operations, such as creating new users, retrieving user information, and managing user accounts.

##using SQLModel to define the database models for users and OCR results, 
# and to perform CRUD operations on the database asynchronously with AsyncSession from SQLAlchemy.
# for asynchronous database operations, we will use AsyncSession from SQLAlchemy, which allows us to perform database operations without blocking the main thread of the application, 
# and to take advantage of the asynchronous capabilities of FastAPI for handling multiple requests concurrently.
from typing import Optional
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

#importing models and schemas for user management, and also the security 
# functions for password hashing and verification.
from src.model import User
from src.schemas import UserCreate
from src.core.security import get_password_hash, verify_password


# user creation function, which takes a UserCreate schema as input, hashes the password, and creates a new user record in the database.
async def create_user(session: AsyncSession, user_create: UserCreate) -> User:

    hashed_password = get_password_hash(user_create.password)

    db_user = User(
        username=user_create.username,
        email=user_create.email,
        password_hash=hashed_password, #only store hashed password, the plaintext should never known by people other than the user
        is_active=True
    )
    #asynchronously add the new user to the database session and commit the transaction, 
    # which will save the new user record in the database.
    session.add(db_user)
    await session.commit()

    #after committing, we need to refresh the db_user instance to get the generated id and other fields from the database, and then return the user object.
    await session.refresh(db_user)
    return db_user


# user lookup functions
async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    result = await session.execute(statement) 
    return result.scalars().first() 

async def get_user_by_username(session: AsyncSession, username: str) -> Optional[User]:
    statement = select(User).where(User.username == username)
    result = await session.execute(statement) 
    return result.scalars().first() 

# id lookup function
async def get_user_by_id(session: AsyncSession, user_id: int) -> Optional[User]:
    return await session.get(User, user_id)

#authentication function, which takes an email and a plain text password, 
#retrieves the user by email, and verifies the password using the verify_password function from the security module.
async def authenticate_user(
    session: AsyncSession, username: str, password: str) -> Optional[User]:

    #retrieve the user by username, and if the user exists, verify the password using the verify_password function from the security module.
    user = await get_user_by_username(session, username)

    #if the user does not exist or the password is incorrect, return None, otherwise return the user object.
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user