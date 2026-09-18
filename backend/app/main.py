from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.services.seed_data import seed_database
from app.api.auth import router as auth_router
from app.api.research import router as research_router
from app.api.documents import router as documents_router
from app.api.admin import router as admin_router
from app.api.portal import router as portal_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    Base.metadata.create_all(bind=engine)
    # Seed default users and documents
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(research_router, prefix=settings.API_V1_STR)
app.include_router(documents_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(portal_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": "Nova Solutions NexusGuard Core Platform API",
        "status": "online",
        "version": "1.0.0",
        "interactive_api_docs": "/docs",
        "health_check": "/api/health",
        "frontend_instructions": "To view the user interface website, run 'npm run dev' inside the frontend folder and open http://localhost:5173"
    }

@app.get("/api/docs")
def redirect_to_docs():
    return RedirectResponse(url="/docs")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Nova Solutions NexusGuard Core Platform",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
