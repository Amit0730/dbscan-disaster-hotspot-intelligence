from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import init_db, SessionLocal
from backend.app.api import routes_mission, routes_data, routes_clustering, routes_validation, routes_report
from backend.app.models.db_models import Mission

# Initialize database schema immediately on import
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize demo data on startup if database is empty
    db = SessionLocal()
    try:
        mission = db.query(Mission).first()
        if not mission:
            print("Seeding initial realistic disaster demo dataset...")
            routes_mission.load_demo_mission(db)
            print("Demo mission ready!")
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="DBSCAN-Based Hotspot Clustering of Drone-Survey Thermal and Visual Signals for Disaster Response Prioritization (SIH26030)",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(routes_mission.router, prefix=settings.API_V1_STR)
app.include_router(routes_data.router, prefix=settings.API_V1_STR)
app.include_router(routes_clustering.router, prefix=settings.API_V1_STR)
app.include_router(routes_validation.router, prefix=settings.API_V1_STR)
app.include_router(routes_report.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "mapping_id": settings.MAPPING_ID,
        "status": "ONLINE",
        "docs_url": "/docs"
    }
