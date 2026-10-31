"""
Bolna AI Voice service - The "Voice" of the system.
Handles agent creation, call initiation, call tracking, and webhook processing.

Based on official Bolna API documentation:
- Base URL: https://api.bolna.ai
- POST /v2/agent - Create agent
- POST /call - Initiate outbound call
- Auth: Bearer token
"""
import json
import httpx
from typing import Optional, List, Any
from uuid import UUID
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class BolnaService:
    """Service for interacting with Bolna AI voice platform."""

    def __init__(self):
        self.api_key = settings.BOLNA_API_KEY
        self.base_url = settings.BOLNA_API_BASE_URL or "https://api.bolna.ai"
        self.is_available = bool(self.api_key)

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "BusinessVoiceAI/1.0",
        }

    async def create_agent(
        self,
        agent_name: str,
        system_prompt: str,
        welcome_message: str = "Hello! How can I help you today?",
        webhook_url: Optional[str] = None,
        voice_id: Optional[str] = None,
        language: str = "en",
        max_duration: int = 600,
        llm_model: str = "gpt-4o-mini",
        llm_provider: str = "openai",
    ) -> dict:
        """
        Create a voice agent on Bolna platform.
        POST /v2/agent
        """
        if not self.is_available:
            return self._demo_agent_response(agent_name)

        payload = {
            "agent_config": {
                "agent_name": agent_name,
                "agent_welcome_message": welcome_message,
                "agent_type": "other",
                "tasks": [
                    {
                        "task_config": {
                            "hangup_after_silence": 10,
                            "incremental_delay": 400,
                            "number_of_words_for_interruption": 2,
                        },
                        "tools_config": {
                            "llm_agent": {
                                "model": llm_model,
                                "provider": llm_provider,
                                "family": llm_provider,
                            }
                        },
                    }
                ],
                "calling_guardrails": {
                    "call_start_hour": 9,
                    "call_end_hour": 17,
                },
            },
            "agent_prompts": {
                "task_1": {
                    "prompt": system_prompt,
                }
            },
        }

        if webhook_url:
            payload["agent_config"]["webhook_url"] = webhook_url

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/v2/agent",
                    headers=self._headers(),
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                logger.info(f"Bolna agent created: {data}")
                return {
                    "success": True,
                    "agent_id": data.get("agent_id", data.get("id")),
                    "data": data,
                    "is_demo": False,
                }
        except httpx.HTTPStatusError as e:
            logger.error(f"Bolna API error: {e.response.status_code} - {e.response.text}")
            return {
                "success": False,
                "error": f"Bolna API error: {e.response.status_code}",
                "details": e.response.text,
                "is_demo": False,
            }
        except Exception as e:
            logger.error(f"Bolna connection error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "is_demo": False,
            }

    async def initiate_call(
        self,
        agent_id: str,
        phone_number: str,
        user_data: Optional[dict] = None,
        from_phone: Optional[str] = None,
    ) -> dict:
        """
        Initiate an outbound call via Bolna.
        POST /call
        """
        if not self.is_available:
            return self._demo_call_response(phone_number)

        payload = {
            "agent_id": agent_id,
            "recipient_phone_number": phone_number,
        }

        if from_phone:
            payload["from_phone_number"] = from_phone

        if user_data:
            payload["user_data"] = user_data

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/call",
                    headers=self._headers(),
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                logger.info(f"Bolna call initiated: {data}")
                return {
                    "success": True,
                    "execution_id": data.get("execution_id"),
                    "call_id": data.get("call_id", data.get("execution_id")),
                    "data": data,
                    "is_demo": False,
                }
        except httpx.HTTPStatusError as e:
            logger.error(f"Bolna call error: {e.response.status_code} - {e.response.text}")
            return {
                "success": False,
                "error": f"Bolna API error: {e.response.status_code}",
                "details": e.response.text,
                "is_demo": False,
            }
        except Exception as e:
            logger.error(f"Bolna call connection error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "is_demo": False,
            }

    async def get_agent(self, agent_id: str) -> dict:
        """Get agent details from Bolna."""
        if not self.is_available:
            return {"is_demo": True, "agent_id": agent_id, "status": "active"}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/v2/agent/{agent_id}",
                    headers=self._headers(),
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error fetching Bolna agent: {e}")
            return {"error": str(e)}

    async def get_call_status(self, execution_id: str) -> dict:
        """Get call/execution status from Bolna."""
        if not self.is_available:
            return self._demo_call_status(execution_id)

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/executions/{execution_id}",
                    headers=self._headers(),
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error fetching call status: {e}")
            return {"error": str(e)}

    async def create_batch(
        self,
        agent_id: str,
        contacts: list,
        campaign_name: str = "batch_call",
    ) -> dict:
        """Create a batch campaign for multiple calls. POST /batches"""
        if not self.is_available:
            return {
                "is_demo": True,
                "batch_id": "demo-batch-001",
                "total_contacts": len(contacts),
                "status": "created",
            }

        payload = {
            "agent_id": agent_id,
            "campaign_name": campaign_name,
            "contacts": contacts,
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/batches",
                    headers=self._headers(),
                    json=payload,
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Batch creation error: {e}")
            return {"error": str(e)}

    def process_webhook(self, payload: dict, signature: Optional[str] = None) -> dict:
        """Process a webhook event from Bolna."""
        # Verify webhook signature if configured
        if settings.BOLNA_WEBHOOK_SECRET and signature:
            # In production, verify HMAC signature
            pass

        event_type = payload.get("event", "")
        execution_id = payload.get("execution_id", "")
        status = payload.get("status", "")
        outcome = payload.get("outcome", "")

        result = {
            "event_type": event_type,
            "execution_id": execution_id,
            "status": status,
            "outcome": outcome,
            "trail": payload.get("trail", []),
            "raw": payload,
        }

        # Extract call duration from trail
        for node in payload.get("trail", []):
            if node.get("node_type") == "agent":
                outputs = node.get("outputs", {})
                result["call_status"] = outputs.get("call.status", status)
                result["duration_seconds"] = outputs.get("call.duration_s", 0)
                break

        return result

    # ---- Demo mode responses ----
    def _demo_agent_response(self, agent_name: str) -> dict:
        import uuid
        return {
            "success": True,
            "agent_id": f"demo-agent-{uuid.uuid4().hex[:8]}",
            "data": {"agent_name": agent_name, "status": "created"},
            "is_demo": True,
        }

    def _demo_call_response(self, phone_number: str) -> dict:
        import uuid
        return {
            "success": True,
            "execution_id": f"demo-exec-{uuid.uuid4().hex[:8]}",
            "call_id": f"demo-call-{uuid.uuid4().hex[:8]}",
            "data": {"phone_number": phone_number, "status": "queued"},
            "is_demo": True,
        }

    def _demo_call_status(self, execution_id: str) -> dict:
        return {
            "execution_id": execution_id,
            "status": "completed",
            "outcome": "success",
            "duration_s": 120,
            "is_demo": True,
        }


# Singleton
bolna_service = BolnaService()
