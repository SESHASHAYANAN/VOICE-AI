"""
Authentication API routes.
"""
import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password, create_access_token, create_refresh_token, decode_token, get_current_user
)
from app.models.user import User, Organization, OrganizationMembership, UserRole
from app.schemas.auth import (
    LoginRequest, RegisterRequest, TokenResponse, UserResponse,
    OrganizationCreate, OrganizationResponse, RefreshTokenRequest,
)
from app.services.business import seed_demo_data
from app.core.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text


@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user and optionally create an organization."""
    # Check if email exists
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        phone=data.phone,
    )
    db.add(user)
    await db.flush()

    org = None
    if data.organization_name:
        slug = slugify(data.organization_name)
        # Ensure unique slug
        existing_slug = await db.execute(select(Organization).where(Organization.slug == slug))
        if existing_slug.scalar_one_or_none():
            slug = f"{slug}-{str(user.id)[:8]}"

        org = Organization(
            name=data.organization_name,
            slug=slug,
            business_type=data.business_type,
        )
        db.add(org)
        await db.flush()

        # Create membership
        membership = OrganizationMembership(
            user_id=user.id,
            organization_id=org.id,
            role=UserRole.OWNER,
        )
        db.add(membership)
        await db.flush()

        # Create default agent
        from app.models.agent import Agent
        default_agent = Agent(
            organization_id=org.id,
            name="Business Assistant",
            description="Your AI business assistant for managing operations",
            agent_type="general",
            personality="Professional, helpful, and efficient. Speaks clearly and concisely.",
            language="en",
            languages_supported=["en", "hi"],
            system_prompt="You are a professional business assistant. Help customers with orders, appointments, payments, and general inquiries. Always be polite and professional. If you cannot help, offer to connect with a human representative.",
            greeting_message="Hello! Thank you for calling. How can I assist you today?",
        )
        db.add(default_agent)
        await db.flush()

        # Seed demo data if in demo mode
        if settings.is_demo_mode:
            await seed_demo_data(db, org.id)

    # Generate tokens
    token_data = {"sub": str(user.id)}
    if org:
        token_data["org_id"] = str(org.id)

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email and password."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    # Get user's organization
    membership_result = await db.execute(
        select(OrganizationMembership).where(
            OrganizationMembership.user_id == user.id
        ).limit(1)
    )
    membership = membership_result.scalar_one_or_none()

    token_data = {"sub": str(user.id)}
    if membership:
        token_data["org_id"] = str(membership.organization_id)
        token_data["role"] = membership.role.value

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Refresh access token."""
    payload = decode_token(data.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    token_data = {"sub": str(user.id)}
    if "org_id" in payload:
        token_data["org_id"] = payload["org_id"]

    access_token = create_access_token(token_data)
    new_refresh = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    """Get current user profile."""
    return UserResponse.model_validate(user)


@router.get("/organization", response_model=OrganizationResponse)
async def get_my_organization(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's organization."""
    result = await db.execute(
        select(Organization)
        .join(OrganizationMembership)
        .where(OrganizationMembership.user_id == user.id)
        .limit(1)
    )
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="No organization found")
    return OrganizationResponse.model_validate(org)
