from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    total_score: int
    is_admin: bool
    name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class LevelBase(BaseModel):
    name: str
    description: str
    order_index: int
    points: int
    unlocked_by_default: bool
    x_percent: int
    y_percent: int

class LevelResponse(LevelBase):
    id: int
    unlocked: bool
    submissions: List["SubmissionSimple"] = []

    class Config:
        from_attributes = True

class SubmissionSimple(BaseModel):
    part: str
    is_correct: bool
    answer: str
    attempts: int

    class Config:
        from_attributes = True

class SubmissionCreate(BaseModel):
    level_id: int
    part: str = "final"
    answer: str

class SubmissionResponse(BaseModel):
    is_correct: bool
    message: str

class LevelScore(BaseModel):
    level_id: int
    level_name: str
    score: int

class LeaderboardEntry(BaseModel):
    email: str
    name: Optional[str] = None
    total_score: int
    level_scores: List[LevelScore]

class GameStateResponse(BaseModel):
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    is_active: bool
