"""
Pydantic schemas for business operations.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime


# ---- Customer ----
class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=1)
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    customer_type: str = "regular"
    tags: List[str] = []
    notes: Optional[str] = None
    preferred_language: str = "en"

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    customer_type: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    do_not_call: Optional[bool] = None
    preferred_language: Optional[str] = None

class CustomerResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    customer_type: str
    total_orders: int
    total_spent: float
    satisfaction_score: Optional[float] = None
    is_active: bool
    do_not_call: bool
    created_at: datetime
    class Config:
        from_attributes = True


# ---- Supplier ----
class SupplierCreate(BaseModel):
    name: str = Field(..., min_length=1)
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    category: Optional[str] = None
    payment_terms: Optional[str] = None
    is_preferred: bool = False
    notes: Optional[str] = None

class SupplierResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    category: Optional[str] = None
    rating: float
    total_orders: int
    is_preferred: bool
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True


# ---- Product ----
class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1)
    sku: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    unit_price: float = 0.0
    cost_price: Optional[float] = None
    unit: str = "piece"
    stock_quantity: int = 0
    reorder_level: int = 10
    reorder_quantity: int = 50
    preferred_supplier_id: Optional[UUID] = None
    is_bestseller: bool = False
    tags: List[str] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    unit_price: Optional[float] = None
    cost_price: Optional[float] = None
    unit: Optional[str] = None
    stock_quantity: Optional[int] = None
    reorder_level: Optional[int] = None
    reorder_quantity: Optional[int] = None
    preferred_supplier_id: Optional[UUID] = None
    is_bestseller: Optional[bool] = None
    tags: Optional[List[str]] = None

class ProductResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    sku: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    unit_price: float
    cost_price: Optional[float] = None
    unit: str
    stock_quantity: int
    reorder_level: int
    reorder_quantity: int
    preferred_supplier_id: Optional[UUID] = None
    is_active: bool
    is_bestseller: bool
    created_at: datetime
    class Config:
        from_attributes = True


# ---- Order ----
class OrderItemSchema(BaseModel):
    product_id: Optional[str] = None
    name: str
    quantity: int
    unit_price: float
    total: float

class OrderCreate(BaseModel):
    customer_id: Optional[UUID] = None
    items: List[OrderItemSchema] = []
    delivery_date: Optional[datetime] = None
    delivery_address: Optional[str] = None
    notes: Optional[str] = None
    source: str = "manual"

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    delivery_date: Optional[datetime] = None
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: UUID
    organization_id: UUID
    customer_id: Optional[UUID] = None
    order_number: str
    status: str
    items: List[dict] = []
    subtotal: float
    tax: float
    discount: float
    total: float
    payment_status: str
    delivery_date: Optional[datetime] = None
    source: str
    created_at: datetime
    class Config:
        from_attributes = True


# ---- Appointment ----
class AppointmentCreate(BaseModel):
    customer_id: Optional[UUID] = None
    title: str
    description: Optional[str] = None
    appointment_type: str = "general"
    scheduled_at: datetime
    duration_minutes: int = 30
    location: Optional[str] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None

class AppointmentUpdate(BaseModel):
    title: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    status: Optional[str] = None
    location: Optional[str] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: UUID
    organization_id: UUID
    customer_id: Optional[UUID] = None
    title: str
    appointment_type: str
    scheduled_at: datetime
    duration_minutes: int
    status: str
    location: Optional[str] = None
    assigned_to: Optional[str] = None
    reminder_sent: bool
    created_at: datetime
    class Config:
        from_attributes = True


# ---- Payment ----
class PaymentCreate(BaseModel):
    customer_id: Optional[UUID] = None
    order_id: Optional[UUID] = None
    amount: float
    currency: str = "INR"
    payment_method: Optional[str] = None
    due_date: Optional[datetime] = None
    invoice_number: Optional[str] = None
    notes: Optional[str] = None

class PaymentUpdate(BaseModel):
    status: Optional[str] = None
    payment_method: Optional[str] = None
    paid_at: Optional[datetime] = None
    notes: Optional[str] = None

class PaymentResponse(BaseModel):
    id: UUID
    organization_id: UUID
    customer_id: Optional[UUID] = None
    order_id: Optional[UUID] = None
    amount: float
    currency: str
    status: str
    payment_method: Optional[str] = None
    due_date: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    invoice_number: Optional[str] = None
    reminder_count: int
    created_at: datetime
    class Config:
        from_attributes = True


# ---- Support Ticket ----
class TicketCreate(BaseModel):
    customer_id: Optional[UUID] = None
    subject: str
    description: Optional[str] = None
    category: Optional[str] = None
    priority: str = "medium"

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution: Optional[str] = None

class TicketResponse(BaseModel):
    id: UUID
    organization_id: UUID
    customer_id: Optional[UUID] = None
    ticket_number: str
    subject: str
    description: Optional[str] = None
    category: Optional[str] = None
    status: str
    priority: str
    assigned_to: Optional[str] = None
    resolution: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True


# ---- Call ----
class CallInitiateRequest(BaseModel):
    agent_id: UUID
    phone_number: str
    purpose: Optional[str] = None
    context: Optional[dict] = None
    customer_id: Optional[UUID] = None

class CallResponse(BaseModel):
    id: UUID
    organization_id: UUID
    agent_id: Optional[UUID] = None
    customer_id: Optional[UUID] = None
    bolna_call_id: Optional[str] = None
    direction: str
    status: str
    phone_number: Optional[str] = None
    purpose: Optional[str] = None
    duration_seconds: Optional[int] = None
    outcome: Optional[str] = None
    sentiment: Optional[str] = None
    human_handoff: bool
    created_at: datetime
    class Config:
        from_attributes = True

class TranscriptResponse(BaseModel):
    id: UUID
    call_id: UUID
    messages: List[dict] = []
    summary: Optional[str] = None
    key_points: List[str] = []
    action_items: List[str] = []
    created_at: datetime
    class Config:
        from_attributes = True


# ---- Workflow ----
class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_type: str = "manual"
    trigger_config: Optional[dict] = None
    steps: List[dict] = []
    requires_approval: bool = False

class WorkflowResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    description: Optional[str] = None
    trigger_type: str
    steps: List[dict] = []
    requires_approval: bool
    status: str
    execution_count: int
    last_executed_at: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True


# ---- Dashboard ----
class DashboardMetrics(BaseModel):
    total_calls: int = 0
    successful_calls: int = 0
    active_agents: int = 0
    pending_orders: int = 0
    pending_payments: float = 0.0
    open_tickets: int = 0
    upcoming_appointments: int = 0
    low_stock_products: int = 0
    customer_satisfaction: float = 0.0
    revenue_this_month: float = 0.0
    calls_today: int = 0
    is_demo: bool = False


class BusinessInsight(BaseModel):
    title: str
    description: str
    severity: str = "info"  # info, warning, action_required
    category: str = "general"
    suggested_action: Optional[str] = None


# ---- AI Command ----
class AICommandRequest(BaseModel):
    instruction: str
    context: Optional[dict] = None

class AICommandResponse(BaseModel):
    understanding: str
    plan: List[dict] = []
    requires_approval: bool = False
    actions_taken: List[dict] = []
    summary: str
    is_demo: bool = False
