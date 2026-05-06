import hashlib
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add the project root to sys.path so we can import app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import engine, SessionLocal
from app.models import models

def seed_levels():
    db = SessionLocal()
    
    # Create tables if they don't exist
    models.Base.metadata.create_all(bind=engine)

    # Check if we already have levels
    existing_levels = db.query(models.Level).count()
    if existing_levels > 0:
        print(f"Database already has {existing_levels} levels. Updating coordinates and names for 6 levels.")
        levels = db.query(models.Level).order_by(models.Level.order_index).limit(6).all()
        
        new_data = [
            {"name": "New York Airport, USA", "x": 26, "y": 32, "points": 100, "a": "sub_a", "s2": "sub_2", "s3": "sub_3", "f": "final"},
            {"name": "Secure Military Base, Morocco", "x": 43, "y": 40, "points": 100, "a": "sub_a", "s2": "sub_2", "s3": "sub_3", "f": "final"},
            {"name": "Home Sweet Home, China", "x": 75, "y": 40, "points": 100, "a": "sub_a", "s2": "sub_2", "s3": "sub_3", "f": "final"},
            {"name": "Diplomatic Gala, France", "x": 45, "y": 30, "points": 100, "a": "sub_a", "s2": "sub_2", "s3": "sub_3", "f": "final"},
            {"name": "Secret Laboratory, Australia", "x": 85, "y": 70, "points": 100, "a": "sub_a", "s2": "sub_2", "s3": "sub_3", "f": "final"},
            {"name": "Final Destination, Antarctica", "x": 60, "y": 90, "points": 0, "a": "sub_a", "s2": "sub_2", "s3": "sub_3", "f": "final"}
        ]
        
        for i, lvl in enumerate(levels):
            if i < len(new_data):
                lvl.name = new_data[i]["name"]
                lvl.x_percent = new_data[i]["x"]
                lvl.y_percent = new_data[i]["y"]
                lvl.points = new_data[i]["points"]
                lvl.sub_a_hash = hashlib.sha256(new_data[i]["a"].encode()).hexdigest()
                lvl.sub_2_hash = hashlib.sha256(new_data[i]["s2"].encode()).hexdigest()
                lvl.sub_3_hash = hashlib.sha256(new_data[i]["s3"].encode()).hexdigest()
                lvl.answer_hash = hashlib.sha256(new_data[i]["f"].encode()).hexdigest()
        
        db.commit()
        print("Updated levels.")
        return

    print("Seeding new levels...")
    levels_data = [
        {
            "name": "New York Airport, USA",
            "description": """--- MISSION BRIEFING ---
Operative, you have arrived at JFK. Your objective is to infiltrate the airport's secure network and extract the flight manifest.

1. Sublevel A: Find the hidden SSID in the departure lounge.
2. Sublevel 2: Crack the WPA2 handshake of the maintenance network.
3. Sublevel 3: Bypass the firewall on the manifest server.

Once you have all three pieces, combine them into the final flag format: ENTITY{A_B_C}""",
            "order_index": 1,
            "points": 100,
            "sub_a": "sub_a",
            "sub_2": "sub_2",
            "sub_3": "sub_3",
            "answer": "flag{welcome_to_the_grid}",
            "unlocked_by_default": True,
            "x_percent": 26,
            "y_percent": 32
        },
        {
            "name": "Secure Military Base, Morocco",
            "description": "Decipher the encryption protecting the central vault storage.",
            "order_index": 2,
            "points": 100,
            "sub_a": "sub_a",
            "sub_2": "sub_2",
            "sub_3": "sub_3",
            "answer": "flag{vault_breached_successfully}",
            "unlocked_by_default": False,
            "x_percent": 43,
            "y_percent": 40
        },
        {
            "name": "Home Sweet Home, China",
            "description": "Gain root access to the mainframe core systems.",
            "order_index": 3,
            "points": 100,
            "sub_a": "sub_a",
            "sub_2": "sub_2",
            "sub_3": "sub_3",
            "answer": "flag{core_overload_initiated}",
            "unlocked_by_default": False,
            "x_percent": 75,
            "y_percent": 40
        },
        {
            "name": "Diplomatic Gala, France",
            "description": "Hijack the satellite uplink to intercept global data flow.",
            "order_index": 4,
            "points": 100,
            "sub_a": "sub_a",
            "sub_2": "sub_2",
            "sub_3": "sub_3",
            "answer": "flag{satellite_downlink_acquired}",
            "unlocked_by_default": False,
            "x_percent": 45,
            "y_percent": 30
        },
        {
            "name": "Secret Laboratory, Australia",
            "description": "The final stage. Control the global network backbone.",
            "order_index": 5,
            "points": 100,
            "sub_a": "sub_a",
            "sub_2": "sub_2",
            "sub_3": "sub_3",
            "answer": "flag{master_of_the_digital_realm}",
            "unlocked_by_default": False,
            "x_percent": 85,
            "y_percent": 70
        },
        {
            "name": "Final Destination, Antarctica",
            "description": "Reach the final destination and complete the mission.",
            "order_index": 6,
            "points": 0,
            "sub_a": "sub_a",
            "sub_2": "sub_2",
            "sub_3": "sub_3",
            "answer": "flag{the_end_is_just_the_beginning}",
            "unlocked_by_default": False,
            "x_percent": 60,
            "y_percent": 90
        }
    ]

    for data in levels_data:
        answer = data.pop("answer")
        sub_a = data.pop("sub_a")
        sub_2 = data.pop("sub_2")
        sub_3 = data.pop("sub_3")
        
        answer_hash = hashlib.sha256(answer.encode()).hexdigest()
        sub_a_hash = hashlib.sha256(sub_a.encode()).hexdigest()
        sub_2_hash = hashlib.sha256(sub_2.encode()).hexdigest()
        sub_3_hash = hashlib.sha256(sub_3.encode()).hexdigest()
        
        lvl = models.Level(
            **data, 
            answer_hash=answer_hash,
            sub_a_hash=sub_a_hash,
            sub_2_hash=sub_2_hash,
            sub_3_hash=sub_3_hash
        )
        db.add(lvl)
    
    # Also ensure GameState exists
    if db.query(models.GameState).count() == 0:
        gs = models.GameState(is_active=True)
        db.add(gs)

    db.commit()
    print("Seeding completed.")

if __name__ == "__main__":
    seed_levels()
