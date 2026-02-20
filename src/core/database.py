#db engine using SQLModel, which is built on top of SQLAlchemy, to define the database models and perform database operations asynchronously.
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

# Database configuration
DATABASE_URL = "sqlite+aiosqlite:///./database.db"

# create the asynchronous engine using the specified database URL, and enable SQL logging for debugging purposes.
engine = create_async_engine(
    DATABASE_URL, 
    echo=True,   
    future=True
)

# 3. sessionmaker for creating asynchronous sessions, which will be used to interact with the database in an asynchronous context.  
async_session_maker = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False 
)

# 4. init_db function to initialize the database by creating the necessary tables based on the defined models.
async def init_db():
    async with engine.begin() as conn:
        # run_sync is used to run the synchronous create_all method of SQLModel.metadata in an asynchronous context, which will create the tables in the database if they don't already exist.
        await conn.run_sync(SQLModel.metadata.create_all)

# 5. get_session function is an asynchronous generator that provides a database session for use in API endpoints or other parts of the application that need to interact with the database.
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
