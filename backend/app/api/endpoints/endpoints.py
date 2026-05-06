from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime
from sqlalchemy.sql import func
from app.db.session import get_db
from app.models import models
from app.schemas import schemas
from app.core import security
import hashlib

router = APIRouter()

MAX_ATTEMPTS_PER_LEVEL = 5

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def is_level_unlocked(db: Session, user_id: int, level: models.Level) -> bool:
    if level.unlocked_by_default:
        return True
    if level.order_index is None or level.order_index <= 1:
        return True
    prev = (
        db.query(models.Level)
        .filter(models.Level.order_index == level.order_index - 1)
        .first()
    )
    if not prev:
        return True
    
    # Need 60 points in previous level to unlock next
    res = (
        db.query(func.count(models.Submission.id))
        .filter(
            models.Submission.user_id == user_id,
            models.Submission.level_id == prev.id,
            models.Submission.is_correct == True,
        )
        .scalar()
    )
    points_in_prev = (res or 0) * 20
    
    return points_in_prev >= 60


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=schemas.Token)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"Registration attempt for: {user_in.email}")
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        print(f"Registration failed: {user_in.email} already exists")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        hashed_password = security.get_password_hash(user_in.password)
        new_user = models.User(
            email=user_in.email,
            password_hash=hashed_password
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"Registration successful for: {user_in.email}")
    except Exception as e:
        print(f"Registration error for {user_in.email}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error during registration")
    
    access_token = security.create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    print(f"Login attempt for: {form_data.username}")
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user:
        print(f"Login failed: User {form_data.username} not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not security.verify_password(form_data.password, user.password_hash):
        print(f"Login failed: Incorrect password for {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"Login successful for: {form_data.username}")
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/users/me", response_model=schemas.UserResponse)
def update_me(
    user_update: schemas.UserBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    current_user.name = user_update.name
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/levels", response_model=list[schemas.LevelResponse])
def get_levels(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    levels = db.query(models.Level).order_by(models.Level.order_index).all()
    result = []
    for lvl in levels:
        # Get submissions for this user and level
        user_submissions = (
            db.query(models.Submission)
            .filter(
                models.Submission.user_id == current_user.id,
                models.Submission.level_id == lvl.id
            )
            .all()
        )
        
        result.append(
            schemas.LevelResponse(
                id=lvl.id,
                name=lvl.name,
                description=lvl.description,
                order_index=lvl.order_index,
                points=lvl.points,
                unlocked_by_default=lvl.unlocked_by_default,
                unlocked=is_level_unlocked(db, current_user.id, lvl),
                x_percent=lvl.x_percent,
                y_percent=lvl.y_percent,
                submissions=[
                    schemas.SubmissionSimple(
                        part=s.part,
                        is_correct=s.is_correct,
                        answer=s.answer,
                        attempts=s.attempts
                    ) for s in user_submissions
                ]
            )
        )
    return result

@router.get("/levels/{level_id}", response_model=schemas.LevelResponse)
def get_level(level_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    level = db.query(models.Level).filter(models.Level.id == level_id).first()
    if not level:
        raise HTTPException(status_code=404, detail="Level not found")
    
    # Get submissions for this user and level
    user_submissions = (
        db.query(models.Submission)
        .filter(
            models.Submission.user_id == current_user.id,
            models.Submission.level_id == level.id
        )
        .all()
    )
    
    return schemas.LevelResponse(
        id=level.id,
        name=level.name,
        description=level.description,
        order_index=level.order_index,
        points=level.points,
        unlocked_by_default=level.unlocked_by_default,
        unlocked=is_level_unlocked(db, current_user.id, level),
        x_percent=level.x_percent,
        y_percent=level.y_percent,
        submissions=[
            schemas.SubmissionSimple(
                part=s.part,
                is_correct=s.is_correct,
                answer=s.answer,
                attempts=s.attempts
            ) for s in user_submissions
        ]
    )

@router.post("/submit", response_model=schemas.SubmissionResponse)
def submit_answer(
    submission: schemas.SubmissionCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Check game state
    game_state = db.query(models.GameState).filter(models.GameState.is_active == True).first()
    if not game_state:
        raise HTTPException(status_code=400, detail="No active game")
    
    now = datetime.utcnow()
    if game_state.start_time and now < game_state.start_time:
        raise HTTPException(status_code=400, detail="Game has not started yet")
    if game_state.end_time and now > game_state.end_time:
        raise HTTPException(status_code=400, detail="Game has ended")

    level = db.query(models.Level).filter(models.Level.id == submission.level_id).first()
    if not level:
        raise HTTPException(status_code=404, detail="Level not found")

    # Enforce unlocks
    if not is_level_unlocked(db, current_user.id, level):
        raise HTTPException(status_code=403, detail="Level is locked")

    # Attempt limits per user/level/part
    attempts_count = db.query(models.Submission).filter(
        models.Submission.user_id == current_user.id,
        models.Submission.level_id == level.id,
        models.Submission.part == submission.part,
    ).count()
    if attempts_count >= MAX_ATTEMPTS_PER_LEVEL:
        raise HTTPException(status_code=429, detail="Attempt limit reached for this part")

    # Compare hashes
    answer_hash = hashlib.sha256(submission.answer.encode()).hexdigest()
    
    target_hash = None
    if submission.part == 'a':
        target_hash = level.sub_a_hash
    elif submission.part == '2':
        target_hash = level.sub_2_hash
    elif submission.part == '3':
        target_hash = level.sub_3_hash
    elif submission.part == 'final':
        target_hash = level.answer_hash
    else:
        raise HTTPException(status_code=400, detail="Invalid part")

    is_correct = (target_hash is not None and answer_hash == target_hash)

    # Check if already solved to avoid double points
    existing_correct = db.query(models.Submission).filter(
        models.Submission.user_id == current_user.id,
        models.Submission.level_id == level.id,
        models.Submission.part == submission.part,
        models.Submission.is_correct == True
    ).first()

    # Re-fetch attempts count to avoid race conditions or use current count
    attempts_count = db.query(models.Submission).filter(
        models.Submission.user_id == current_user.id,
        models.Submission.level_id == level.id,
        models.Submission.part == submission.part,
    ).count()

    # Record submission
    new_submission = models.Submission(
        user_id=current_user.id,
        level_id=level.id,
        part=submission.part,
        answer=submission.answer,
        is_correct=is_correct,
        attempts=attempts_count + 1,
    )
    db.add(new_submission)

    if is_correct:
        if not existing_correct:
            current_user.total_score += 20
            db.add(current_user)
            message = "Correct!"
        else:
            message = "Already solved!"
    else:
        message = "Incorrect."

    db.commit()
    return {"is_correct": is_correct, "message": message}

@router.post("/levels/{level_id}/increase-attempts")
def increase_attempts(
    level_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    level = db.query(models.Level).filter(models.Level.id == level_id).first()
    if not level:
        raise HTTPException(status_code=404, detail="Level not found")
    
    # Check if level is unlocked
    if not is_level_unlocked(db, current_user.id, level):
        raise HTTPException(status_code=403, detail="Level is locked")
    
    # Check current attempts and score for this level
    submissions = db.query(models.Submission).filter(
        models.Submission.user_id == current_user.id,
        models.Submission.level_id == level.id
    ).all()
    
    # Calculate score based on unique solved parts
    solved_parts = {s.part for s in submissions if s.is_correct}
    score = len(solved_parts) * 20
    
    # Check if any unsolved part has exhausted its attempts
    parts = ['a', '2', '3', 'final']
    
    any_unsolved_exhausted = False
    exhausted_parts = []
    for part in parts:
        if part not in solved_parts:
            part_attempts = sum(1 for s in submissions if s.part == part)
            if part_attempts >= MAX_ATTEMPTS_PER_LEVEL:
                any_unsolved_exhausted = True
                exhausted_parts.append(part)
    
    if not any_unsolved_exhausted:
        raise HTTPException(status_code=400, detail="No unsolved part has exhausted its attempts yet")
    
    if score >= 80:
        raise HTTPException(status_code=400, detail="Level is already fully solved")
    
    # Reset attempts for exhausted unsolved parts
    # We do this by deleting up to 2 submissions for those parts
    for part in exhausted_parts:
        submissions_to_delete = (
            db.query(models.Submission)
            .filter(
                models.Submission.user_id == current_user.id,
                models.Submission.level_id == level_id,
                models.Submission.part == part,
                models.Submission.is_correct == False
            )
            .order_by(models.Submission.id.desc())
            .limit(2)
            .all()
        )
        for s in submissions_to_delete:
            db.delete(s)
    
    db.commit()
    return {"message": f"Added 2 attempts for parts: {', '.join(exhausted_parts)}"}

@router.get("/leaderboard", response_model=list[schemas.LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    levels = db.query(models.Level).order_by(models.Level.order_index).all()
    
    leaderboard = []
    for user in users:
        level_scores = []
        for level in levels:
            # Calculate score for this level based on unique solved parts (20 points each)
            solved_parts = db.query(models.Submission.part).filter(
                models.Submission.user_id == user.id,
                models.Submission.level_id == level.id,
                models.Submission.is_correct == True
            ).distinct().all()
            
            level_score = len(solved_parts) * 20
            level_scores.append(schemas.LevelScore(
                level_id=level.id,
                level_name=level.name,
                score=level_score
            ))
            
        total_calculated_score = sum(ls.score for ls in level_scores)
        
        leaderboard.append(schemas.LeaderboardEntry(
            email=user.email,
            name=user.name,
            total_score=total_calculated_score,
            level_scores=level_scores
        ))
    
    # Sort leaderboard by total_calculated_score desc
    leaderboard.sort(key=lambda x: x.total_score, reverse=True)
    return leaderboard[:10]

@router.get("/game-state", response_model=schemas.GameStateResponse)
def get_game_state(db: Session = Depends(get_db)):
    game_state = db.query(models.GameState).filter(models.GameState.is_active == True).first()
    if not game_state:
         return {"is_active": False, "start_time": None, "end_time": None}
    return game_state
