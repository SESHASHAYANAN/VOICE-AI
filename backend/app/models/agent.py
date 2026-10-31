"""
AI Agent models.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Text, ForeignKey, Integer, Float, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Agent(Base):
    __tablename__ = "agents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    agent_type = Column(String(50), nullable=False, default="general")  # general, sales, support, scheduler, collector
    personality = Column(Text, nullable=True)
    voice_id = Column(String(100), nullable=True)
    voice_provider = Column(String(50), default="bolna")
    language = Column(String(10), default="en")
    languages_supported = Column(JSON, default=list)
    system_prompt = Column(Text, nullable=True)
    knowledge_base = Column(Text, nullable=True)  # JSON string of knowledge docs
    greeting_message = Column(Text, nullable=True)
    
    # Bolna integration
    bolna_agent_id = Column(String(255), nullable=True)
    bolna_config = Column(JSON, nullable=True)
    
    # Calling config
    inbound_enabled = Column(Boolean, default=False)
    outbound_enabled = Column(Boolean, default=True)
    phone_number = Column(String(20), nullable=True)
    max_call_duration = Column(Integer, default=600)  # seconds
    working_hours_start = Column(String(5), default="09:00")
    working_hours_end = Column(String(5), default="18:00")
    working_days = Column(JSON, default=lambda: [1, 2, 3, 4, 5])  # Mon-Fri
    
    # Escalation
    escalation_enabled = Column(Boolean, default=True)
    escalation_phone = Column(String(20), nullable=True)
    escalation_rules = Column(JSON, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_deployed = Column(Boolean, default=False)
    total_calls = Column(Integer, default=0)
    successful_calls = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization", back_populates="agents")
    calls = relationship("Call", back_populates="agent", cascade="all, delete-orphan")


class AgentTemplate(Base):
    __tablename__ = "agent_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    business_type = Column(String(100), nullable=False)  # hospital, hotel, retail, service
    description = Column(Text, nullable=True)
    agent_type = Column(String(50), nullable=False)
    system_prompt = Column(Text, nullable=False)
    personality = Column(Text, nullable=True)
    greeting_message = Column(Text, nullable=True)
    default_config = Column(JSON, nullable=True)
    workflows = Column(JSON, nullable=True)  # Pre-configured workflow templates
    dashboard_metrics = Column(JSON, nullable=True)  # Pre-configured metrics
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
