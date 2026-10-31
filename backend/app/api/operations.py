"""
Business operations API routes - Dashboard, Orders, Customers, Payments, etc.
"""
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, OrganizationMembership
from app.models import (
    Customer, Supplier, Product, Order, Payment, Appointment, SupportTicket,
    Call, Transcript, Workflow, Agent, OrderStatus, PaymentStatus
)
from app.schemas.business import (
    CustomerCreate, CustomerUpdate, CustomerResponse,
    SupplierCreate, SupplierResponse,
    ProductCreate, ProductUpdate, ProductResponse,
    OrderCreate, OrderUpdate, OrderResponse,
    PaymentCreate, PaymentUpdate, PaymentResponse,
    AppointmentCreate, AppointmentUpdate, AppointmentResponse,
    TicketCreate, TicketUpdate, TicketResponse,
    CallInitiateRequest, CallResponse, TranscriptResponse,
    WorkflowCreate, WorkflowResponse,
    DashboardMetrics, BusinessInsight,
    AICommandRequest, AICommandResponse,
)
from app.services.business import BusinessService
from app.services.grok import grok_service
import random
from datetime import datetime, timezone

router = APIRouter(prefix="/api", tags=["Business Operations"])


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


# ===== Dashboard =====
@router.get("/dashboard/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard metrics computed from database records."""
    org_id = await get_org_id(user, db)
    service = BusinessService(db, org_id)
    metrics = await service.get_dashboard_metrics()
    return DashboardMetrics(**metrics)


@router.get("/dashboard/insights", response_model=list[BusinessInsight])
async def get_business_insights(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get AI-generated business insights."""
    org_id = await get_org_id(user, db)
    service = BusinessService(db, org_id)
    metrics = await service.get_dashboard_metrics()
    insights = await grok_service.generate_business_insights(metrics)
    return [BusinessInsight(**i) for i in insights]


@router.get("/dashboard/recent-calls", response_model=list[CallResponse])
async def get_recent_calls(
    limit: int = Query(default=10, le=50),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get recent calls."""
    org_id = await get_org_id(user, db)
    result = await db.execute(
        select(Call).where(Call.organization_id == org_id)
        .order_by(Call.created_at.desc()).limit(limit)
    )
    calls = result.scalars().all()
    return [CallResponse.model_validate(c) for c in calls]


# ===== AI Command =====
@router.post("/ai/command", response_model=AICommandResponse)
async def execute_ai_command(
    data: AICommandRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Execute a natural language business command."""
    org_id = await get_org_id(user, db)
    service = BusinessService(db, org_id)
    result = await service.process_ai_command(data.instruction)
    return AICommandResponse(**result)


# ===== Customers =====
@router.get("/customers", response_model=list[CustomerResponse])
async def list_customers(
    search: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    query = select(Customer).where(Customer.organization_id == org_id)
    if search:
        query = query.where(Customer.name.ilike(f"%{search}%"))
    result = await db.execute(query.order_by(Customer.created_at.desc()))
    return [CustomerResponse.model_validate(c) for c in result.scalars().all()]


@router.post("/customers", response_model=CustomerResponse)
async def create_customer(
    data: CustomerCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    customer = Customer(organization_id=org_id, **data.model_dump())
    db.add(customer)
    await db.flush()
    return CustomerResponse.model_validate(customer)


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    result = await db.execute(
        select(Customer).where(and_(Customer.id == customer_id, Customer.organization_id == org_id))
    )
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return CustomerResponse.model_validate(customer)


# ===== Suppliers =====
@router.get("/suppliers", response_model=list[SupplierResponse])
async def list_suppliers(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    result = await db.execute(
        select(Supplier).where(Supplier.organization_id == org_id).order_by(Supplier.created_at.desc())
    )
    return [SupplierResponse.model_validate(s) for s in result.scalars().all()]


@router.post("/suppliers", response_model=SupplierResponse)
async def create_supplier(
    data: SupplierCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    supplier = Supplier(organization_id=org_id, **data.model_dump())
    db.add(supplier)
    await db.flush()
    return SupplierResponse.model_validate(supplier)


# ===== Products =====
@router.get("/products", response_model=list[ProductResponse])
async def list_products(
    category: Optional[str] = None,
    low_stock: Optional[bool] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    query = select(Product).where(Product.organization_id == org_id)
    if category:
        query = query.where(Product.category == category)
    if low_stock:
        query = query.where(Product.stock_quantity <= Product.reorder_level)
    result = await db.execute(query.order_by(Product.created_at.desc()))
    return [ProductResponse.model_validate(p) for p in result.scalars().all()]


@router.post("/products", response_model=ProductResponse)
async def create_product(
    data: ProductCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    product = Product(organization_id=org_id, **data.model_dump())
    db.add(product)
    await db.flush()
    return ProductResponse.model_validate(product)


# ===== Orders =====
@router.get("/orders", response_model=list[OrderResponse])
async def list_orders(
    status: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    query = select(Order).where(Order.organization_id == org_id)
    if status:
        query = query.where(Order.status == status)
    result = await db.execute(query.order_by(Order.created_at.desc()))
    return [OrderResponse.model_validate(o) for o in result.scalars().all()]


@router.post("/orders", response_model=OrderResponse)
async def create_order(
    data: OrderCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    total = sum(item.total for item in data.items)
    order = Order(
        organization_id=org_id,
        customer_id=data.customer_id,
        order_number=f"ORD-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
        items=[item.model_dump() for item in data.items],
        subtotal=total,
        total=total,
        delivery_date=data.delivery_date,
        delivery_address=data.delivery_address,
        notes=data.notes,
        source=data.source,
    )
    db.add(order)
    await db.flush()
    return OrderResponse.model_validate(order)


@router.put("/orders/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: UUID, data: OrderUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    result = await db.execute(
        select(Order).where(and_(Order.id == order_id, Order.organization_id == org_id))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(order, field, value)
    await db.flush()
    return OrderResponse.model_validate(order)


# ===== Payments =====
@router.get("/payments", response_model=list[PaymentResponse])
async def list_payments(
    status: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    query = select(Payment).where(Payment.organization_id == org_id)
    if status:
        query = query.where(Payment.status == status)
    result = await db.execute(query.order_by(Payment.created_at.desc()))
    return [PaymentResponse.model_validate(p) for p in result.scalars().all()]


@router.post("/payments", response_model=PaymentResponse)
async def create_payment(
    data: PaymentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    payment = Payment(organization_id=org_id, **data.model_dump())
    db.add(payment)
    await db.flush()
    return PaymentResponse.model_validate(payment)


# ===== Appointments =====
@router.get("/appointments", response_model=list[AppointmentResponse])
async def list_appointments(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    result = await db.execute(
        select(Appointment).where(Appointment.organization_id == org_id)
        .order_by(Appointment.scheduled_at.desc())
    )
    return [AppointmentResponse.model_validate(a) for a in result.scalars().all()]


@router.post("/appointments", response_model=AppointmentResponse)
async def create_appointment(
    data: AppointmentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    appt = Appointment(organization_id=org_id, **data.model_dump())
    db.add(appt)
    await db.flush()
    return AppointmentResponse.model_validate(appt)


# ===== Support Tickets =====
@router.get("/tickets", response_model=list[TicketResponse])
async def list_tickets(
    status: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    query = select(SupportTicket).where(SupportTicket.organization_id == org_id)
    if status:
        query = query.where(SupportTicket.status == status)
    result = await db.execute(query.order_by(SupportTicket.created_at.desc()))
    return [TicketResponse.model_validate(t) for t in result.scalars().all()]


@router.post("/tickets", response_model=TicketResponse)
async def create_ticket(
    data: TicketCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    ticket = SupportTicket(
        organization_id=org_id,
        ticket_number=f"TKT-{datetime.now().strftime('%Y%m%d')}-{random.randint(100, 999)}",
        **data.model_dump(),
    )
    db.add(ticket)
    await db.flush()
    return TicketResponse.model_validate(ticket)


# ===== Calls =====
@router.get("/calls", response_model=list[CallResponse])
async def list_calls(
    status: Optional[str] = None,
    direction: Optional[str] = None,
    limit: int = Query(default=50, le=200),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    query = select(Call).where(Call.organization_id == org_id)
    if status:
        query = query.where(Call.status == status)
    if direction:
        query = query.where(Call.direction == direction)
    result = await db.execute(query.order_by(Call.created_at.desc()).limit(limit))
    return [CallResponse.model_validate(c) for c in result.scalars().all()]


@router.post("/calls/initiate", response_model=CallResponse)
async def initiate_call(
    data: CallInitiateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Initiate an outbound voice call."""
    from app.models.communications import Call, CallDirection, CallStatus
    org_id = await get_org_id(user, db)

    # Verify agent
    result = await db.execute(
        select(Agent).where(and_(Agent.id == data.agent_id, Agent.organization_id == org_id))
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Initiate via Bolna
    from app.services.bolna import bolna_service
    bolna_result = await bolna_service.initiate_call(
        agent_id=agent.bolna_agent_id or "demo",
        phone_number=data.phone_number,
        user_data=data.context,
    )

    call = Call(
        organization_id=org_id,
        agent_id=agent.id,
        customer_id=data.customer_id,
        bolna_call_id=bolna_result.get("call_id"),
        direction=CallDirection.OUTBOUND,
        status=CallStatus.QUEUED,
        phone_number=data.phone_number,
        purpose=data.purpose,
        context=data.context,
    )
    db.add(call)
    await db.flush()
    return CallResponse.model_validate(call)


@router.get("/calls/{call_id}/transcript", response_model=TranscriptResponse)
async def get_call_transcript(
    call_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    result = await db.execute(
        select(Transcript).join(Call).where(
            and_(Transcript.call_id == call_id, Call.organization_id == org_id)
        )
    )
    transcript = result.scalar_one_or_none()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return TranscriptResponse.model_validate(transcript)


# ===== Workflows =====
@router.get("/workflows", response_model=list[WorkflowResponse])
async def list_workflows(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    result = await db.execute(
        select(Workflow).where(Workflow.organization_id == org_id).order_by(Workflow.created_at.desc())
    )
    return [WorkflowResponse.model_validate(w) for w in result.scalars().all()]


@router.post("/workflows", response_model=WorkflowResponse)
async def create_workflow(
    data: WorkflowCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = await get_org_id(user, db)
    workflow = Workflow(organization_id=org_id, **data.model_dump())
    db.add(workflow)
    await db.flush()
    return WorkflowResponse.model_validate(workflow)


# ===== Analytics =====
@router.get("/analytics/calls")
async def get_call_analytics(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get call analytics data for charts."""
    org_id = await get_org_id(user, db)

    # Call outcomes
    outcomes = await db.execute(
        select(Call.outcome, func.count(Call.id))
        .where(and_(Call.organization_id == org_id, Call.outcome.isnot(None)))
        .group_by(Call.outcome)
    )
    outcome_data = [{"name": r[0] or "unknown", "value": r[1]} for r in outcomes.all()]

    # Call by purpose
    purposes = await db.execute(
        select(Call.purpose, func.count(Call.id))
        .where(and_(Call.organization_id == org_id, Call.purpose.isnot(None)))
        .group_by(Call.purpose)
    )
    purpose_data = [{"name": r[0] or "other", "value": r[1]} for r in purposes.all()]

    # Sentiment
    sentiments = await db.execute(
        select(Call.sentiment, func.count(Call.id))
        .where(and_(Call.organization_id == org_id, Call.sentiment.isnot(None)))
        .group_by(Call.sentiment)
    )
    sentiment_data = [{"name": r[0], "value": r[1]} for r in sentiments.all()]

    return {
        "outcomes": outcome_data,
        "purposes": purpose_data,
        "sentiments": sentiment_data,
    }


@router.get("/analytics/revenue")
async def get_revenue_analytics(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get revenue analytics."""
    org_id = await get_org_id(user, db)

    # Total revenue
    total = await db.scalar(
        select(func.coalesce(func.sum(Order.total), 0))
        .where(and_(Order.organization_id == org_id, Order.status != OrderStatus.CANCELLED))
    ) or 0

    # Orders by status
    statuses = await db.execute(
        select(Order.status, func.count(Order.id), func.coalesce(func.sum(Order.total), 0))
        .where(Order.organization_id == org_id)
        .group_by(Order.status)
    )
    status_data = [
        {"name": r[0].value if hasattr(r[0], 'value') else r[0], "count": r[1], "revenue": float(r[2])}
        for r in statuses.all()
    ]

    # Payment status
    payment_stats = await db.execute(
        select(Payment.status, func.count(Payment.id), func.coalesce(func.sum(Payment.amount), 0))
        .where(Payment.organization_id == org_id)
        .group_by(Payment.status)
    )
    payment_data = [
        {"name": r[0].value if hasattr(r[0], 'value') else r[0], "count": r[1], "amount": float(r[2])}
        for r in payment_stats.all()
    ]

    return {
        "total_revenue": float(total),
        "orders_by_status": status_data,
        "payments_by_status": payment_data,
    }
