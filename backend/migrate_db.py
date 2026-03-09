import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'entity_platform.db')

def migrate():
    print(f"Connecting to database at {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Adding x_percent column to levels table...")
        cursor.execute("ALTER TABLE levels ADD COLUMN x_percent INTEGER DEFAULT 50;")
        print("Added x_percent column.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("x_percent column already exists.")
        else:
            print(f"Error adding x_percent: {e}")

    try:
        print("Adding y_percent column to levels table...")
        cursor.execute("ALTER TABLE levels ADD COLUMN y_percent INTEGER DEFAULT 50;")
        print("Added y_percent column.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("y_percent column already exists.")
        else:
            print(f"Error adding y_percent: {e}")

    conn.commit()
    conn.close()
    print("Migration completed.")

if __name__ == "__main__":
    migrate()
