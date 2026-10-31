"""
Business operations service - handles core business logic.
"""
import uuid
import random
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models import *
from app.services.grok import grok_service
from app.services.bolna import bolna_service
import logging

logger = logging.getLogger(__name__)


class BusinessService:
    """Core business operations service."""

    def __init__(self, db: AsyncSession, org_id: uuid.UUID):
        self.db = db
        self.org_id = org_id

    # ---- Dashboard Metrics ----
    async def get_dashboard_metrics(self) -> dict:
        """Compute dashboard metrics from actual database records."""
        now = datetime.now(timezone.utc)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        # Total calls
        total_calls = await self.db.scalar(
            select(func.count(Call.id)).where(Call.organization_id == self.org_id)
        ) or 0

        # Successful calls
        successful_calls = await self.db.scalar(
            select(func.count(Call.id)).where(
                and_(Call.organization_id == self.org_id, Call.status == CallStatus.COMPLETED)
            )
        ) or 0

        # Active agents
        active_agents = await self.db.scalar(
            select(func.count(Agent.id)).where(
                and_(Agent.organization_id == self.org_id, Agent.is_active == True)
            )
        ) or 0

        # Pending orders
        pending_orders = await self.db.scalar(
            select(func.count(Order.id)).where(
                and_(Order.organization_id == self.org_id, Order.status == OrderStatus.PENDING)
            )
        ) or 0

        # Pending payments
        pending_payments = await self.db.scalar(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                and_(
                    Payment.organization_id == self.org_id,
                    Payment.status.in_([PaymentStatus.PENDING, PaymentStatus.OVERDUE])
                )
            )
        ) or 0.0

        # Open tickets
        open_tickets = await self.db.scalar(
            select(func.count(SupportTicket.id)).where(
                and_(
                    SupportTicket.organization_id == self.org_id,
                    SupportTicket.status.in_([TicketStatus.OPEN, TicketStatus.IN_PROGRESS])
                )
            )
        ) or 0

        # Upcoming appointments
        upcoming_appointments = await self.db.scalar(
            select(func.count(Appointment.id)).where(
                and_(
                    Appointment.organization_id == self.org_id,
                    Appointment.scheduled_at >= now,
                    Appointment.status == "scheduled"
                )
            )
        ) or 0

        # Low stock products
        low_stock = await self.db.scalar(
            select(func.count(Product.id)).where(
                and_(
                    Product.organization_id == self.org_id,
                    Product.stock_quantity <= Product.reorder_level,
                    Product.is_active == True,
                )
            )
        ) or 0

        # Revenue this month
        revenue = await self.db.scalar(
            select(func.coalesce(func.sum(Order.total), 0)).where(
                and_(
                    Order.organization_id == self.org_id,
                    Order.created_at >= month_start,
                    Order.status != OrderStatus.CANCELLED,
                )
            )
        ) or 0.0

        # Calls today
        calls_today = await self.db.scalar(
            select(func.count(Call.id)).where(
                and_(Call.organization_id == self.org_id, Call.created_at >= today_start)
            )
        ) or 0

        # Average satisfaction
        avg_satisfaction = await self.db.scalar(
            select(func.avg(Customer.satisfaction_score)).where(
                and_(
                    Customer.organization_id == self.org_id,
                    Customer.satisfaction_score.isnot(None),
                )
            )
        ) or 0.0

        return {
            "total_calls": total_calls,
            "successful_calls": successful_calls,
            "active_agents": active_agents,
            "pending_orders": pending_orders,
            "pending_payments": float(pending_payments),
            "open_tickets": open_tickets,
            "upcoming_appointments": upcoming_appointments,
            "low_stock_products": low_stock,
            "revenue_this_month": float(revenue),
            "calls_today": calls_today,
            "customer_satisfaction": round(float(avg_satisfaction), 1),
            "is_demo": False,
        }

    # ---- AI Command Processing ----
    async def process_ai_command(self, instruction: str) -> dict:
        """Process a natural language business instruction using Grok."""
        # Gather business context
        context = await self._build_business_context()

        # Parse with Grok
        result = await grok_service.parse_business_instruction(instruction, context)

        actions_taken = []
        requires_approval = False

        # Process tool calls from Grok
        for tool_call in result.get("tool_calls", []):
            fn_name = tool_call["function"]
            args = tool_call["arguments"]

            if fn_name in ["create_purchase_order", "reschedule_delivery"]:
                requires_approval = True

            action_result = await self._execute_tool(fn_name, args)
            actions_taken.append({
                "action": fn_name,
                "arguments": args,
                "result": action_result,
                "status": "completed" if not requires_approval else "pending_approval",
            })

        return {
            "understanding": result.get("content", ""),
            "plan": [
                {"step": i + 1, "action": tc["function"], "details": tc["arguments"]}
                for i, tc in enumerate(result.get("tool_calls", []))
            ],
            "requires_approval": requires_approval,
            "actions_taken": actions_taken,
            "summary": result.get("content", "Instruction processed."),
            "is_demo": not grok_service.is_available,
        }

    async def _execute_tool(self, tool_name: str, args: dict) -> dict:
        """Execute a business tool action."""
        handlers = {
            "check_inventory": self._handle_check_inventory,
            "create_purchase_order": self._handle_create_po,
            "reschedule_delivery": self._handle_reschedule,
            "initiate_call": self._handle_initiate_call,
            "create_order": self._handle_create_order,
            "send_payment_reminder": self._handle_payment_reminder,
            "schedule_appointment": self._handle_schedule_appointment,
            "get_business_summary": self._handle_business_summary,
        }

        handler = handlers.get(tool_name)
        if handler:
            return await handler(args)
        return {"error": f"Unknown tool: {tool_name}"}

    async def _handle_check_inventory(self, args: dict) -> dict:
        product_name = args.get("product_name", "")
        result = await self.db.execute(
            select(Product).where(
                and_(
                    Product.organization_id == self.org_id,
                    Product.name.ilike(f"%{product_name}%"),
                )
            )
        )
        products = result.scalars().all()
        if products:
            p = products[0]
            return {
                "product": p.name,
                "stock": p.stock_quantity,
                "reorder_level": p.reorder_level,
                "needs_reorder": p.stock_quantity <= p.reorder_level,
                "unit_price": p.unit_price,
            }
        return {"error": f"Product '{product_name}' not found"}

    async def _handle_create_po(self, args: dict) -> dict:
        """Create a purchase order (requires approval)."""
        product_name = args.get("product_name", "")
        quantity = args.get("quantity", 0)

        # Find product
        result = await self.db.execute(
            select(Product).where(
                and_(Product.organization_id == self.org_id, Product.name.ilike(f"%{product_name}%"))
            )
        )
        product = result.scalar_one_or_none()

        if not product:
            return {"error": f"Product '{product_name}' not found"}

        # Find supplier
        supplier = None
        if product.preferred_supplier_id:
            result = await self.db.execute(
                select(Supplier).where(Supplier.id == product.preferred_supplier_id)
            )
            supplier = result.scalar_one_or_none()

        if not supplier:
            result = await self.db.execute(
                select(Supplier).where(
                    and_(Supplier.organization_id == self.org_id, Supplier.is_preferred == True)
                )
            )
            supplier = result.scalar_one_or_none()

        po = PurchaseOrder(
            organization_id=self.org_id,
            supplier_id=supplier.id if supplier else None,
            po_number=f"PO-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
            status="pending_approval",
            items=[{
                "product_id": str(product.id),
                "name": product.name,
                "quantity": quantity,
                "unit_price": product.cost_price or product.unit_price,
                "total": quantity * (product.cost_price or product.unit_price),
            }],
            total=quantity * (product.cost_price or product.unit_price),
        )
        self.db.add(po)
        await self.db.flush()

        return {
            "po_number": po.po_number,
            "product": product.name,
            "quantity": quantity,
            "supplier": supplier.name if supplier else "No supplier assigned",
            "total": po.total,
            "status": "pending_approval",
        }

    async def _handle_reschedule(self, args: dict) -> dict:
        new_date = args.get("new_date")
        result = await self.db.execute(
            select(Order).where(
                and_(
                    Order.organization_id == self.org_id,
                    Order.status.in_([OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING]),
                )
            ).order_by(Order.created_at.desc()).limit(1)
        )
        order = result.scalar_one_or_none()
        if order:
            order.delivery_date = datetime.fromisoformat(new_date) if new_date else None
            order.notes = (order.notes or "") + f"\nDelivery rescheduled to {new_date}"
            return {
                "order_number": order.order_number,
                "new_delivery_date": new_date,
                "status": "rescheduled",
            }
        return {"error": "No active orders found to reschedule"}

    async def _handle_initiate_call(self, args: dict) -> dict:
        contact_type = args.get("contact_type", "customer")
        purpose = args.get("purpose", "follow_up")
        contact_name = args.get("contact_name", "")

        # Find contact
        phone = None
        if contact_type == "customer":
            result = await self.db.execute(
                select(Customer).where(
                    and_(
                        Customer.organization_id == self.org_id,
                        Customer.name.ilike(f"%{contact_name}%"),
                        Customer.do_not_call == False,
                    )
                )
            )
            contact = result.scalar_one_or_none()
            if contact:
                phone = contact.phone
        else:
            result = await self.db.execute(
                select(Supplier).where(
                    and_(Supplier.organization_id == self.org_id, Supplier.name.ilike(f"%{contact_name}%"))
                )
            )
            contact = result.scalar_one_or_none()
            if contact:
                phone = contact.phone

        if not phone:
            return {"error": f"{contact_type.title()} '{contact_name}' not found or no phone number"}

        # Get default agent
        result = await self.db.execute(
            select(Agent).where(
                and_(Agent.organization_id == self.org_id, Agent.is_active == True)
            ).limit(1)
        )
        agent = result.scalar_one_or_none()

        if not agent:
            return {"error": "No active agent available"}

        # Initiate call through Bolna
        bolna_result = await bolna_service.initiate_call(
            agent_id=agent.bolna_agent_id or "demo",
            phone_number=phone,
            user_data={
                "contact_name": contact_name,
                "purpose": purpose,
                "talking_points": args.get("talking_points", []),
            }
        )

        # Record the call
        call = Call(
            organization_id=self.org_id,
            agent_id=agent.id,
            bolna_call_id=bolna_result.get("call_id"),
            direction=CallDirection.OUTBOUND,
            status=CallStatus.QUEUED,
            phone_number=phone,
            purpose=purpose,
            context=args,
        )
        self.db.add(call)
        await self.db.flush()

        return {
            "call_id": str(call.id),
            "phone": phone,
            "status": "queued",
            "is_demo": bolna_result.get("is_demo", False),
        }

    async def _handle_create_order(self, args: dict) -> dict:
        items = args.get("items", [])
        order = Order(
            organization_id=self.org_id,
            order_number=f"ORD-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
            items=items,
            total=sum(item.get("total", 0) for item in items),
            source="ai_command",
        )
        self.db.add(order)
        await self.db.flush()
        return {"order_number": order.order_number, "total": order.total}

    async def _handle_payment_reminder(self, args: dict) -> dict:
        customer_name = args.get("customer_name", "")
        result = await self.db.execute(
            select(Payment).join(Customer).where(
                and_(
                    Payment.organization_id == self.org_id,
                    Customer.name.ilike(f"%{customer_name}%"),
                    Payment.status.in_([PaymentStatus.PENDING, PaymentStatus.OVERDUE]),
                )
            )
        )
        payment = result.scalar_one_or_none()
        if payment:
            payment.reminder_count += 1
            payment.last_reminder_at = datetime.now(timezone.utc)
            return {
                "invoice": payment.invoice_number,
                "amount": payment.amount,
                "reminder_count": payment.reminder_count,
                "status": "reminder_sent",
            }
        return {"message": f"No pending payments for '{customer_name}'"}

    async def _handle_schedule_appointment(self, args: dict) -> dict:
        appt = Appointment(
            organization_id=self.org_id,
            title=args.get("appointment_type", "General Appointment"),
            appointment_type=args.get("appointment_type", "general"),
            scheduled_at=datetime.fromisoformat(args.get("date_time", datetime.now(timezone.utc).isoformat())),
            duration_minutes=args.get("duration_minutes", 30),
        )
        self.db.add(appt)
        await self.db.flush()
        return {"appointment_id": str(appt.id), "scheduled_at": str(appt.scheduled_at)}

    async def _handle_business_summary(self, args: dict) -> dict:
        metrics = await self.get_dashboard_metrics()
        return metrics

    async def _build_business_context(self) -> dict:
        """Build context dict for Grok with current business state."""
        # Get recent orders
        orders_result = await self.db.execute(
            select(Order).where(Order.organization_id == self.org_id)
            .order_by(Order.created_at.desc()).limit(5)
        )
        recent_orders = orders_result.scalars().all()

        # Get low stock products
        products_result = await self.db.execute(
            select(Product).where(
                and_(
                    Product.organization_id == self.org_id,
                    Product.stock_quantity <= Product.reorder_level,
                )
            )
        )
        low_stock = products_result.scalars().all()

        # Get active agents
        agents_result = await self.db.execute(
            select(Agent).where(
                and_(Agent.organization_id == self.org_id, Agent.is_active == True)
            )
        )
        agents = agents_result.scalars().all()

        return {
            "recent_orders": [
                {"order_number": o.order_number, "status": o.status.value if hasattr(o.status, 'value') else o.status, "total": o.total}
                for o in recent_orders
            ],
            "low_stock_products": [
                {"name": p.name, "stock": p.stock_quantity, "reorder_level": p.reorder_level}
                for p in low_stock
            ],
            "active_agents": [{"name": a.name, "type": a.agent_type} for a in agents],
        }


# ---- Demo data seeder ----
async def seed_demo_data(db: AsyncSession, org_id: uuid.UUID):
    """Seed realistic demo data for an organization."""
    now = datetime.now(timezone.utc)

    # Customers
    customers_data = [
        {"name": "Priya Sharma", "email": "priya@example.com", "phone": "+919876543210",
         "city": "Mumbai", "state": "Maharashtra", "customer_type": "premium",
         "total_orders": 15, "total_spent": 125000.0, "satisfaction_score": 4.5},
        {"name": "Rahul Verma", "email": "rahul@example.com", "phone": "+919876543211",
         "city": "Delhi", "state": "Delhi", "customer_type": "regular",
         "total_orders": 8, "total_spent": 45000.0, "satisfaction_score": 4.0},
        {"name": "Anita Patel", "email": "anita@example.com", "phone": "+919876543212",
         "city": "Ahmedabad", "state": "Gujarat", "customer_type": "wholesale",
         "total_orders": 25, "total_spent": 350000.0, "satisfaction_score": 4.8},
        {"name": "Vikram Singh", "email": "vikram@example.com", "phone": "+919876543213",
         "city": "Jaipur", "state": "Rajasthan", "customer_type": "regular",
         "total_orders": 5, "total_spent": 28000.0, "satisfaction_score": 3.5},
        {"name": "Meera Krishnan", "email": "meera@example.com", "phone": "+919876543214",
         "city": "Chennai", "state": "Tamil Nadu", "customer_type": "premium",
         "total_orders": 12, "total_spent": 98000.0, "satisfaction_score": 4.2},
    ]

    customers = []
    for cd in customers_data:
        c = Customer(organization_id=org_id, **cd)
        db.add(c)
        customers.append(c)
    await db.flush()

    # Suppliers
    suppliers_data = [
        {"name": "Metro Supplies Pvt Ltd", "contact_person": "Rajesh Kumar",
         "phone": "+919876543220", "city": "Mumbai", "category": "General",
         "rating": 4.5, "total_orders": 50, "is_preferred": True, "payment_terms": "Net 30"},
        {"name": "Quick Electronics", "contact_person": "Suresh Nair",
         "phone": "+919876543221", "city": "Bangalore", "category": "Electronics",
         "rating": 4.0, "total_orders": 30, "is_preferred": False, "payment_terms": "Net 15"},
        {"name": "FreshPack Industries", "contact_person": "Deepa Menon",
         "phone": "+919876543222", "city": "Kochi", "category": "Packaging",
         "rating": 4.3, "total_orders": 20, "is_preferred": True, "payment_terms": "Net 30"},
    ]

    suppliers = []
    for sd in suppliers_data:
        s = Supplier(organization_id=org_id, **sd)
        db.add(s)
        suppliers.append(s)
    await db.flush()

    # Products
    products_data = [
        {"name": "Premium Wireless Earbuds", "sku": "PWE-001", "category": "Electronics",
         "unit_price": 2499.0, "cost_price": 1500.0, "stock_quantity": 8,
         "reorder_level": 20, "reorder_quantity": 50, "is_bestseller": True},
        {"name": "Organic Green Tea (100g)", "sku": "OGT-002", "category": "Beverages",
         "unit_price": 450.0, "cost_price": 200.0, "stock_quantity": 150,
         "reorder_level": 50, "reorder_quantity": 200, "is_bestseller": True},
        {"name": "Bamboo Desk Organizer", "sku": "BDO-003", "category": "Office",
         "unit_price": 899.0, "cost_price": 400.0, "stock_quantity": 35,
         "reorder_level": 15, "reorder_quantity": 40, "is_bestseller": False},
        {"name": "Handmade Scented Candles Set", "sku": "HSC-004", "category": "Home",
         "unit_price": 1299.0, "cost_price": 600.0, "stock_quantity": 5,
         "reorder_level": 10, "reorder_quantity": 30, "is_bestseller": True},
        {"name": "Stainless Steel Water Bottle", "sku": "SSW-005", "category": "Lifestyle",
         "unit_price": 699.0, "cost_price": 300.0, "stock_quantity": 75,
         "reorder_level": 25, "reorder_quantity": 100, "is_bestseller": False},
    ]

    products = []
    for i, pd_item in enumerate(products_data):
        p = Product(
            organization_id=org_id,
            preferred_supplier_id=suppliers[i % len(suppliers)].id,
            **pd_item
        )
        db.add(p)
        products.append(p)
    await db.flush()

    # Orders
    orders_data = [
        {"customer_idx": 0, "status": OrderStatus.DELIVERED, "total": 4998.0,
         "payment_status": PaymentStatus.PAID,
         "items": [{"name": "Premium Wireless Earbuds", "quantity": 2, "unit_price": 2499.0, "total": 4998.0}],
         "days_ago": 5},
        {"customer_idx": 1, "status": OrderStatus.PROCESSING, "total": 2250.0,
         "payment_status": PaymentStatus.PENDING,
         "items": [{"name": "Organic Green Tea (100g)", "quantity": 5, "unit_price": 450.0, "total": 2250.0}],
         "days_ago": 1},
        {"customer_idx": 2, "status": OrderStatus.PENDING, "total": 38970.0,
         "payment_status": PaymentStatus.PENDING,
         "items": [{"name": "Premium Wireless Earbuds", "quantity": 10, "unit_price": 2499.0, "total": 24990.0},
                   {"name": "Handmade Scented Candles Set", "quantity": 6, "unit_price": 1299.0, "total": 7794.0}],
         "days_ago": 0},
        {"customer_idx": 3, "status": OrderStatus.SHIPPED, "total": 699.0,
         "payment_status": PaymentStatus.PAID,
         "items": [{"name": "Stainless Steel Water Bottle", "quantity": 1, "unit_price": 699.0, "total": 699.0}],
         "days_ago": 3},
        {"customer_idx": 4, "status": OrderStatus.CONFIRMED, "total": 8990.0,
         "payment_status": PaymentStatus.PARTIAL,
         "items": [{"name": "Bamboo Desk Organizer", "quantity": 10, "unit_price": 899.0, "total": 8990.0}],
         "days_ago": 2},
    ]

    for i, od in enumerate(orders_data):
        o = Order(
            organization_id=org_id,
            customer_id=customers[od["customer_idx"]].id,
            order_number=f"ORD-2026-{1001 + i}",
            status=od["status"],
            items=od["items"],
            total=od["total"],
            subtotal=od["total"],
            payment_status=od["payment_status"],
            delivery_date=now + timedelta(days=2 - od["days_ago"]),
            created_at=now - timedelta(days=od["days_ago"]),
        )
        db.add(o)
    await db.flush()

    # Payments
    payments_data = [
        {"customer_idx": 1, "amount": 2250.0, "status": PaymentStatus.PENDING,
         "due_date": now + timedelta(days=7), "invoice_number": "INV-2026-001"},
        {"customer_idx": 2, "amount": 38970.0, "status": PaymentStatus.PENDING,
         "due_date": now + timedelta(days=14), "invoice_number": "INV-2026-002"},
        {"customer_idx": 3, "amount": 5000.0, "status": PaymentStatus.OVERDUE,
         "due_date": now - timedelta(days=3), "invoice_number": "INV-2026-003", "reminder_count": 2},
        {"customer_idx": 4, "amount": 4495.0, "status": PaymentStatus.PARTIAL,
         "due_date": now + timedelta(days=5), "invoice_number": "INV-2026-004"},
    ]

    for pd_item in payments_data:
        p = Payment(
            organization_id=org_id,
            customer_id=customers[pd_item["customer_idx"]].id,
            amount=pd_item["amount"],
            status=pd_item["status"],
            due_date=pd_item["due_date"],
            invoice_number=pd_item["invoice_number"],
            reminder_count=pd_item.get("reminder_count", 0),
        )
        db.add(p)

    # Appointments
    appointments_data = [
        {"customer_idx": 0, "title": "Product Demo - Earbuds Collection",
         "scheduled_at": now + timedelta(days=1, hours=2), "appointment_type": "consultation"},
        {"customer_idx": 2, "title": "Wholesale Order Discussion",
         "scheduled_at": now + timedelta(days=2, hours=4), "appointment_type": "general"},
        {"customer_idx": 4, "title": "Service Follow-up",
         "scheduled_at": now + timedelta(days=3), "appointment_type": "followup"},
    ]

    for ad in appointments_data:
        a = Appointment(
            organization_id=org_id,
            customer_id=customers[ad["customer_idx"]].id,
            title=ad["title"],
            scheduled_at=ad["scheduled_at"],
            appointment_type=ad["appointment_type"],
        )
        db.add(a)

    # Support Tickets
    tickets_data = [
        {"customer_idx": 1, "subject": "Late delivery complaint",
         "category": "delivery", "priority": TicketPriority.HIGH, "status": TicketStatus.OPEN},
        {"customer_idx": 3, "subject": "Product quality issue - Water Bottle",
         "category": "product", "priority": TicketPriority.MEDIUM, "status": TicketStatus.IN_PROGRESS},
        {"customer_idx": 0, "subject": "Refund request for damaged item",
         "category": "refund", "priority": TicketPriority.HIGH, "status": TicketStatus.ESCALATED},
    ]

    for i, td in enumerate(tickets_data):
        t = SupportTicket(
            organization_id=org_id,
            customer_id=customers[td["customer_idx"]].id,
            ticket_number=f"TKT-2026-{101 + i}",
            subject=td["subject"],
            category=td["category"],
            priority=td["priority"],
            status=td["status"],
        )
        db.add(t)

    # Calls
    calls_data = [
        {"customer_idx": 0, "direction": CallDirection.OUTBOUND, "status": CallStatus.COMPLETED,
         "purpose": "order_confirm", "duration": 180, "outcome": "successful", "sentiment": "positive"},
        {"customer_idx": 1, "direction": CallDirection.OUTBOUND, "status": CallStatus.COMPLETED,
         "purpose": "payment_reminder", "duration": 120, "outcome": "callback_requested", "sentiment": "neutral"},
        {"customer_idx": 2, "direction": CallDirection.INBOUND, "status": CallStatus.COMPLETED,
         "purpose": "order_inquiry", "duration": 300, "outcome": "successful", "sentiment": "positive"},
        {"customer_idx": 3, "direction": CallDirection.OUTBOUND, "status": CallStatus.NO_ANSWER,
         "purpose": "followup", "duration": 0, "outcome": "no_answer", "sentiment": None},
        {"customer_idx": 4, "direction": CallDirection.OUTBOUND, "status": CallStatus.COMPLETED,
         "purpose": "appointment", "duration": 90, "outcome": "successful", "sentiment": "positive"},
    ]

    for cd in calls_data:
        agent_result = await db.execute(
            select(Agent).where(Agent.organization_id == org_id).limit(1)
        )
        agent = agent_result.scalar_one_or_none()

        c = Call(
            organization_id=org_id,
            agent_id=agent.id if agent else None,
            customer_id=customers[cd["customer_idx"]].id,
            direction=cd["direction"],
            status=cd["status"],
            phone_number=customers[cd["customer_idx"]].phone,
            purpose=cd["purpose"],
            duration_seconds=cd["duration"],
            outcome=cd["outcome"],
            sentiment=cd["sentiment"],
            started_at=now - timedelta(hours=random.randint(1, 48)),
            ended_at=now - timedelta(hours=random.randint(0, 47)),
        )
        db.add(c)

        # Add transcript for completed calls
        if cd["status"] == CallStatus.COMPLETED:
            await db.flush()
            t = Transcript(
                call_id=c.id,
                messages=[
                    {"role": "agent", "content": f"Hello, this is a call regarding {cd['purpose'].replace('_', ' ')}.", "timestamp": str(now)},
                    {"role": "customer", "content": "Yes, I was expecting your call.", "timestamp": str(now)},
                    {"role": "agent", "content": "Thank you for your time. Is there anything else I can help with?", "timestamp": str(now)},
                    {"role": "customer", "content": "No, that's all. Thank you.", "timestamp": str(now)},
                ],
                summary=f"Call regarding {cd['purpose'].replace('_', ' ')} with {customers[cd['customer_idx']].name}",
                key_points=[f"Discussed {cd['purpose'].replace('_', ' ')}", "Customer was receptive"],
                action_items=["Follow up in 3 days"],
            )
            db.add(t)

    await db.commit()
    logger.info(f"Demo data seeded for organization {org_id}")
