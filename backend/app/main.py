import os

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


def get_cors_origins():
    origins = os.getenv("CORS_ORIGINS", "*")
    if origins == "*":
        return ["*"]
    return [origin.strip() for origin in origins.split(",") if origin.strip()]


cors_origins = get_cors_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials="*" not in cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Entity Platform API"}
