from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import endpoints
from app.db.session import engine, Base, get_db
from app.models import models

# Create tables
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")
except Exception as e:
    print(f"Database connection failed: {e}. Tables not created.")

app = FastAPI(title="Entity Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Entity Platform API"}
