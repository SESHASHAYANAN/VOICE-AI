"""
Business Voice AI - FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth_router, agents_router, operations_router, webhooks_router
# Import all models to register them with Base
import app.models  # noqa


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: create tables on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Business Voice AI",
    description="AI-powered Business Voice Operating System - Automate operations through customizable AI phone calls",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(agents_router)
app.include_router(operations_router)
app.include_router(webhooks_router)


@app.get("/")
async def root():
    return {
        "name": "Business Voice AI",
        "version": "1.0.0",
        "status": "running",
        "demo_mode": settings.is_demo_mode,
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
