import hashlib
from datetime import datetime, timezone, timedelta

from app.db.session import SessionLocal, engine
from app.models import models


DEMO_END_TIME = datetime(2026, 5, 30, 14, 0, tzinfo=timezone(timedelta(hours=3)))

TEST_ANSWERS = {
    "sub_a": "sub_a",
    "sub_2": "sub_2",
    "sub_3": "sub_3",
    "final": "final",
}


LEVELS_DATA = [
    {
        "name": "Test Level 1 - Warmup",
        "description": """Simple test assignment.

Use these exact answers to verify submissions:
Sublevel A: sub_a
Sublevel 2: sub_2
Sublevel 3: sub_3
Final Answer: final

Solving any three parts unlocks the next level.""",
        "order_index": 1,
        "points": 100,
        "unlocked_by_default": True,
        "x_percent": 26,
        "y_percent": 32,
    },
    {
        "name": "Test Level 2 - Hash Check",
        "description": """Simple test assignment.

Use these exact answers to verify submissions:
Sublevel A: sub_a
Sublevel 2: sub_2
Sublevel 3: sub_3
Final Answer: final""",
        "order_index": 2,
        "points": 100,
        "unlocked_by_default": False,
        "x_percent": 43,
        "y_percent": 40,
    },
    {
        "name": "Test Level 3 - Login Flow",
        "description": """Simple test assignment.

Use these exact answers to verify submissions:
Sublevel A: sub_a
Sublevel 2: sub_2
Sublevel 3: sub_3
Final Answer: final""",
        "order_index": 3,
        "points": 100,
        "unlocked_by_default": False,
        "x_percent": 75,
        "y_percent": 40,
    },
    {
        "name": "Test Level 4 - Leaderboard",
        "description": """Simple test assignment.

Use these exact answers to verify submissions:
Sublevel A: sub_a
Sublevel 2: sub_2
Sublevel 3: sub_3
Final Answer: final""",
        "order_index": 4,
        "points": 100,
        "unlocked_by_default": False,
        "x_percent": 45,
        "y_percent": 30,
    },
    {
        "name": "Test Level 5 - Attempts",
        "description": """Simple test assignment.

Use these exact answers to verify submissions:
Sublevel A: sub_a
Sublevel 2: sub_2
Sublevel 3: sub_3
Final Answer: final""",
        "order_index": 5,
        "points": 100,
        "unlocked_by_default": False,
        "x_percent": 85,
        "y_percent": 70,
    },
    {
        "name": "Test Level 6 - Finish",
        "description": """Simple test assignment.

Use these exact answers to verify submissions:
Sublevel A: sub_a
Sublevel 2: sub_2
Sublevel 3: sub_3
Final Answer: final""",
        "order_index": 6,
        "points": 100,
        "unlocked_by_default": False,
        "x_percent": 60,
        "y_percent": 90,
    },
]


def answer_hash(answer: str) -> str:
    return hashlib.sha256(answer.encode()).hexdigest()


def seed_levels():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        for data in LEVELS_DATA:
            level = (
                db.query(models.Level)
                .filter(models.Level.order_index == data["order_index"])
                .first()
            )
            if level is None:
                level = models.Level(order_index=data["order_index"])
                db.add(level)

            for field, value in data.items():
                setattr(level, field, value)

            level.sub_a_hash = answer_hash(TEST_ANSWERS["sub_a"])
            level.sub_2_hash = answer_hash(TEST_ANSWERS["sub_2"])
            level.sub_3_hash = answer_hash(TEST_ANSWERS["sub_3"])
            level.answer_hash = answer_hash(TEST_ANSWERS["final"])

        game_state = (
            db.query(models.GameState)
            .filter(models.GameState.is_active == True)
            .first()
        )
        if game_state is None:
            game_state = models.GameState(is_active=True)
            db.add(game_state)
        else:
            game_state.is_active = True
        game_state.start_time = None
        game_state.end_time = DEMO_END_TIME

        db.commit()
        print(f"Seeded {len(LEVELS_DATA)} test levels.")
        print("Test answers: sub_a, sub_2, sub_3, final")
        print("Countdown ends at 2026-05-30 14:00 Europe/Kyiv.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_levels()
