"""
Agent management API routes.
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, OrganizationMembership
from app.models.agent import Agent, AgentTemplate
from app.schemas.agent import (
    AgentCreate, AgentUpdate, AgentResponse, AgentDeployRequest,
    AgentTestRequest, AgentTestResponse, AgentTemplateResponse,
)
from app.services.bolna import bolna_service
from app.services.grok import grok_service

router = APIRouter(prefix="/api/agents", tags=["Agents"])


async def get_org_id(user: User, db: AsyncSession) -> UUID:
    result = await db.execute(
        select(OrganizationMembership.organization_id)
        .where(OrganizationMembership.user_id == user.id)
        .limit(1)
    )
    org_id = result.scalar_one_or_none()
    if not org_id:
        raise HTTPException(status_code=403, detail="No organization found")
    return org_id


@router.get("/", response_model=list[AgentResponse])
async def list_agents(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all agents for the user's organization."""
    org_id = await get_org_id(user, db)
    result = await db.execute(
        select(Agent).where(Agent.organization_id == org_id).order_by(Agent.created_at.desc())
    )
    agents = result.scalars().all()
    return [AgentResponse.model_validate(a) for a in agents]


@router.post("/", response_model=AgentResponse)
async def create_agent(
    data: AgentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new AI agent."""
    org_id = await get_org_id(user, db)

    # Generate system prompt if not provided
    system_prompt = data.system_prompt
    if not system_prompt:
        system_prompt = await grok_service.generate_agent_prompt(
            business_type="general",
            agent_type=data.agent_type,
            custom_instructions=data.personality,
        )

    agent = Agent(
        organization_id=org_id,
        name=data.name,
        description=data.description,
        agent_type=data.agent_type,
        personality=data.personality,
        voice_id=data.voice_id,
        language=data.language,
        languages_supported=data.languages_supported,
        system_prompt=system_prompt,
        knowledge_base=data.knowledge_base,
        greeting_message=data.greeting_message or "Hello! How can I help you today?",
        inbound_enabled=data.inbound_enabled,
        outbound_enabled=data.outbound_enabled,
        max_call_duration=data.max_call_duration,
        working_hours_start=data.working_hours_start,
        working_hours_end=data.working_hours_end,
        working_days=data.working_days,
        escalation_enabled=data.escalation_enabled,
        escalation_phone=data.escalation_phone,
        escalation_rules=data.escalation_rules,
    )
    db.add(agent)
    await db.flush()

    return AgentResponse.model_validate(agent)


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific agent."""
    org_id = await get_org_id(user, db)
    result = await db.execute(
        select(Agent).where(and_(Agent.id == agent_id, Agent.organization_id == org_id))
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AgentResponse.model_validate(agent)


@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: UUID,
    data: AgentUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an agent."""
    org_id = await get_org_id(user, db)
    result = await db.execute(
        select(Agent).where(and_(Agent.id == agent_id, Agent.organization_id == org_id))
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(agent, field, value)

    await db.flush()
    return AgentResponse.model_validate(agent)


@router.post("/{agent_id}/deploy", response_model=AgentResponse)
async def deploy_agent(
    agent_id: UUID,
    data: AgentDeployRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Deploy agent to Bolna for voice operations."""
    org_id = await get_org_id(user, db)
    result = await db.execute(
        select(Agent).where(and_(Agent.id == agent_id, Agent.organization_id == org_id))
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Create agent on Bolna
    bolna_result = await bolna_service.create_agent(
        agent_name=agent.name,
        system_prompt=agent.system_prompt or "",
        welcome_message=agent.greeting_message or "Hello!",
        language=agent.language,
        max_duration=agent.max_call_duration,
    )

    if bolna_result.get("success"):
        agent.bolna_agent_id = bolna_result.get("agent_id")
        agent.is_deployed = True
        if data.phone_number:
            agent.phone_number = data.phone_number
        agent.bolna_config = bolna_result.get("data")
        await db.flush()

    return AgentResponse.model_validate(agent)


@router.post("/{agent_id}/test", response_model=AgentTestResponse)
async def test_agent(
    agent_id: UUID,
    data: AgentTestRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Test an agent with a message."""
    org_id = await get_org_id(user, db)
    result = await db.execute(
        select(Agent).where(and_(Agent.id == agent_id, Agent.organization_id == org_id))
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Use Grok to simulate a response
    grok_result = await grok_service.parse_business_instruction(
        data.message, data.context or {}
    )

    return AgentTestResponse(
        response=grok_result.get("content", "I understood your request."),
        intent=None,
        entities=None,
        suggested_actions=[tc["function"] for tc in grok_result.get("tool_calls", [])],
    )


@router.delete("/{agent_id}")
async def delete_agent(
    agent_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an agent."""
    org_id = await get_org_id(user, db)
    result = await db.execute(
        select(Agent).where(and_(Agent.id == agent_id, Agent.organization_id == org_id))
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    await db.delete(agent)
    return {"message": "Agent deleted"}


@router.get("/templates/all", response_model=list[AgentTemplateResponse])
async def list_templates(db: AsyncSession = Depends(get_db)):
    """List available agent templates."""
    result = await db.execute(
        select(AgentTemplate).where(AgentTemplate.is_active == True)
    )
    templates = result.scalars().all()
    return [AgentTemplateResponse.model_validate(t) for t in templates]
