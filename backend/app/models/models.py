from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    total_score = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_admin = Column(Boolean, default=False)

    submissions = relationship("Submission", back_populates="user")

class Level(Base):
    __tablename__ = "levels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    order_index = Column(Integer, index=True)
    points = Column(Integer, default=100)
    sub_a_hash = Column(String, nullable=True)
    sub_2_hash = Column(String, nullable=True)
    sub_3_hash = Column(String, nullable=True)
    answer_hash = Column(String, nullable=False)
    unlocked_by_default = Column(Boolean, default=False)
    x_percent = Column(Integer, default=50)
    y_percent = Column(Integer, default=50)

    submissions = relationship("Submission", back_populates="level")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    level_id = Column(Integer, ForeignKey("levels.id"))
    part = Column(String, default="final") # 'a', '2', '3', 'final'
    answer = Column(String)
    is_correct = Column(Boolean, default=False)
    attempts = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="submissions")
    level = relationship("Level", back_populates="submissions")

class GameState(Base):
    __tablename__ = "game_state"

    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
