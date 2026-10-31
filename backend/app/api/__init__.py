from app.api.auth import router as auth_router
from app.api.agents import router as agents_router
from app.api.operations import router as operations_router
from app.api.webhooks import router as webhooks_router

__all__ = ["auth_router", "agents_router", "operations_router", "webhooks_router"]
