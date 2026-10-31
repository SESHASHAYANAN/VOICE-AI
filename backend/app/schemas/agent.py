"""
Pydantic schemas for agents.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime


class AgentCreate(BaseModel):
    name: str = Field(..., min_length=2)
    description: Optional[str] = None
    agent_type: str = "general"
    personality: Optional[str] = None
    voice_id: Optional[str] = None
    language: str = "en"
    languages_supported: List[str] = ["en"]
    system_prompt: Optional[str] = None
    knowledge_base: Optional[str] = None
    greeting_message: Optional[str] = None
    inbound_enabled: bool = False
    outbound_enabled: bool = True
    max_call_duration: int = 600
    working_hours_start: str = "09:00"
    working_hours_end: str = "18:00"
    working_days: List[int] = [1, 2, 3, 4, 5]
    escalation_enabled: bool = True
    escalation_phone: Optional[str] = None
    escalation_rules: Optional[dict] = None


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    agent_type: Optional[str] = None
    personality: Optional[str] = None
    voice_id: Optional[str] = None
    language: Optional[str] = None
    languages_supported: Optional[List[str]] = None
    system_prompt: Optional[str] = None
    knowledge_base: Optional[str] = None
    greeting_message: Optional[str] = None
    inbound_enabled: Optional[bool] = None
    outbound_enabled: Optional[bool] = None
    max_call_duration: Optional[int] = None
    working_hours_start: Optional[str] = None
    working_hours_end: Optional[str] = None
    working_days: Optional[List[int]] = None
    escalation_enabled: Optional[bool] = None
    escalation_phone: Optional[str] = None
    escalation_rules: Optional[dict] = None
    is_active: Optional[bool] = None


class AgentResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    description: Optional[str] = None
    agent_type: str
    personality: Optional[str] = None
    voice_id: Optional[str] = None
    language: str
    languages_supported: List[str] = []
    system_prompt: Optional[str] = None
    greeting_message: Optional[str] = None
    bolna_agent_id: Optional[str] = None
    inbound_enabled: bool
    outbound_enabled: bool
    phone_number: Optional[str] = None
    max_call_duration: int
    working_hours_start: str
    working_hours_end: str
    working_days: List[int]
    escalation_enabled: bool
    is_active: bool
    is_deployed: bool
    total_calls: int
    successful_calls: int
    created_at: datetime

    class Config:
        from_attributes = True


class AgentDeployRequest(BaseModel):
    phone_number: Optional[str] = None


class AgentTestRequest(BaseModel):
    message: str
    context: Optional[dict] = None


class AgentTestResponse(BaseModel):
    response: str
    intent: Optional[str] = None
    entities: Optional[dict] = None
    suggested_actions: Optional[List[str]] = None


class AgentTemplateResponse(BaseModel):
    id: UUID
    name: str
    business_type: str
    description: Optional[str] = None
    agent_type: str
    system_prompt: str
    personality: Optional[str] = None
    greeting_message: Optional[str] = None

    class Config:
        from_attributes = True
