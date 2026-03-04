from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Literal
from datetime import datetime
import json


# === User schemas ===

class UserBase(BaseModel):
    username: str
    email: str


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: Optional[str] = None


# === Quiz schemas ===

# Input schema for quiz submission
class QuizSubmit(BaseModel):
    goal_type: Literal["lose_weight", "gain_muscle", "maintain", "improve_endurance"]
    age: int = Field(gt=0, le=120)
    gender: Literal["male", "female", "other"]
    height_cm: float = Field(gt=0)
    weight_kg: float = Field(gt=0)
    target_weight: Optional[float] = Field(default=None, gt=0)
    activity_level: Literal["sedentary", "lightly_active", "moderately_active", "very_active", "extra_active"]
    workout_days: int = Field(ge=1, le=7)
    dietary_preferences: List[str] = []
    allergies: List[str] = []
    limitations: Optional[str] = None


# Response schema with calculated health metrics
class FitnessGoalRead(BaseModel):
    id: int
    user_id: int
    goal_type: str
    age: int
    gender: str
    height_cm: float
    weight_kg: float
    target_weight: Optional[float]
    activity_level: str
    workout_days: int
    dietary_preferences: List[str]
    allergies: List[str]
    limitations: Optional[str]
    bmi: Optional[float]
    bmr: Optional[float]
    tdee: Optional[float]
    quiz_completed: bool
    created_at: datetime
    updated_at: datetime

    # Convert JSON string from DB to Python list
    @field_validator("dietary_preferences", "allergies", mode="before")
    @classmethod
    def parse_json_list(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        if v is None:
            return []
        return v

    class Config:
        from_attributes = True


# Simple status check response
class QuizStatusRead(BaseModel):
    completed: bool
