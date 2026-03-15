# Backend API Development Guide

This guide explains how to add a new feature to the Falcon Fitness system. 
Our backend follows a strict **Four-Layer Architecture** to ensure separation of concerns, asynchronous performance, and security.

---

## The Four-Layer Architecture

When adding a new feature (e.g., `User Profile`), you must implement the following four layers in order:

### 1. The Storage Layer (Model)
- **File:** `src/model.py`
- **Responsibility:** Defines the physical database schema using `SQLModel`.

### 2. The Contract Layer (Schema)
- **File:** `src/schemas.py`
- **Responsibility:** Defines data validation and payload serialization using `Pydantic`.

### 3. The Data Access Layer (CRUD)
- **File:** `src/crud.py`
- **Responsibility:** Executes asynchronous database transactions (`AsyncSession`). It connects Models and Schemas.

### 4. The Routing Layer (API Endpoint)
- **File:** `src/api/v1/endpoints/profile.py`
- **Responsibility:** Handles HTTP requests, enforces authentication, and delegates logic to the CRUD layer.

---

## Step-by-Step Implementation

### Step 1: Define the Model
Define the table and its relationships.

```python
from sqlmodel import SQLModel, Field, Relationship, Column, JSON 
from typing import Optional, List

class UserProfile(SQLModel, table=True):
    __tablename__ = "user_profiles"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True, index=True)

    height_in: float
    weight_lbs: float
    preferences: List[str] = Field(default=[], sa_column=Column(JSON))

    user: Optional["User"] = Relationship(back_populates="profile")


### Step 2: Define the Schema

```python
from pydantic import BaseModel, Field
from typing import List

class UserProfileBase(BaseModel):
    height_in: float = Field(..., gt=0)
    weight_lbs: float = Field(..., gt=0)
    preferences: List[str] = []

class UserProfileCreate(UserProfileBase):
    pass # Exclude user_id, it will be injected by the controller

class UserProfileResponse(UserProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

### Step 3 : define CRUD operation 


```python
from sqlalchemy.ext.asyncio import AsyncSession
from src.model import UserProfile
from src.schemas import UserProfileCreate

async def create_user_profile(
    session: AsyncSession, 
    profile_create: UserProfileCreate, 
    user_id: int
) -> UserProfile:
    
    # Map schema data to the database model and inject the owner ID
    db_profile = UserProfile(
        **profile_create.model_dump(),
        user_id=user_id
    )
    
    session.add(db_profile)
    await session.commit()
    await session.refresh(db_profile)
    
    return db_profile


### Step 4: Create the Router


```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.schemas import UserProfileCreate, UserProfileResponse
from src.model import User
# Assume get_session and get_current_user are defined in dependencies
from src.core.dependencies import get_session, get_current_user
import src.crud as crud

router = APIRouter()

@router.post("/", response_model=UserProfileResponse)
async def create_profile(
    payload: UserProfileCreate, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # The router does NOT contain session.add() or session.commit().
    # It strictly passes the validated payload and the secure user_id to the CRUD layer.
    return await crud.create_user_profile(session, payload, current_user.id)




### Step 5: test new api use FastAPI's built-in tool

Add your new table to (if you have created one) to api/admin.py to use SQLadmin.
see if your new feature correctly creates and retrives new table.