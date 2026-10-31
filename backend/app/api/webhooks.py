"""
Webhook API routes for Bolna call events.
"""
from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional
from app.services.bolna import bolna_service
from app.core.database import async_session_factory
from app.models.communications import Call, CallStatus, Transcript
from sqlalchemy import select
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])


@router.post("/bolna/call-event")
async def bolna_call_event(
    request: Request,
    x_bolna_signature: Optional[str] = Header(None),
):
    """Process Bolna webhook events for call status updates."""
    payload = await request.json()
    logger.info(f"Bolna webhook received: {payload.get('event', 'unknown')}")

    # Process the webhook
    result = bolna_service.process_webhook(payload, x_bolna_signature)

    # Update call record
    execution_id = result.get("execution_id")
    if execution_id:
        async with async_session_factory() as db:
            try:
                query = select(Call).where(Call.bolna_call_id == execution_id)
                call_result = await db.execute(query)
                call = call_result.scalar_one_or_none()

                if call:
                    status_map = {
                        "completed": CallStatus.COMPLETED,
                        "failed": CallStatus.FAILED,
                        "no_answer": CallStatus.NO_ANSWER,
                        "busy": CallStatus.BUSY,
                    }
                    new_status = status_map.get(result.get("call_status", ""), None)
                    if new_status:
                        call.status = new_status
                    call.duration_seconds = result.get("duration_seconds", 0)
                    call.outcome = result.get("outcome", "unknown")

                    await db.commit()
                    logger.info(f"Call {call.id} updated: status={call.status}")
            except Exception as e:
                logger.error(f"Error updating call from webhook: {e}")
                await db.rollback()

    return {"status": "ok", "processed": True}
