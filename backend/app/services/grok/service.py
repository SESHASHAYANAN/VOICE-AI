"""
xAI Grok service - The "Brain" of the system.
Handles business intelligence, NLU, instruction parsing, and action planning.
"""
import json
import httpx
from typing import Optional, List, Any
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Tool definitions for Grok function calling
BUSINESS_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "check_inventory",
            "description": "Check current inventory levels for a product",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {"type": "string", "description": "Name or SKU of the product"},
                },
                "required": ["product_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_purchase_order",
            "description": "Create a purchase order to reorder stock from a supplier",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {"type": "string"},
                    "quantity": {"type": "integer"},
                    "supplier_name": {"type": "string", "description": "Supplier name, or 'preferred' to use the default"},
                },
                "required": ["product_name", "quantity"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "reschedule_delivery",
            "description": "Reschedule a customer delivery to a new date",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string", "description": "Order ID or 'latest' for the most recent"},
                    "new_date": {"type": "string", "description": "New delivery date in ISO format"},
                    "customer_name": {"type": "string"},
                },
                "required": ["new_date"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "initiate_call",
            "description": "Initiate a voice call to a customer or supplier",
            "parameters": {
                "type": "object",
                "properties": {
                    "contact_type": {"type": "string", "enum": ["customer", "supplier"]},
                    "contact_name": {"type": "string"},
                    "purpose": {"type": "string"},
                    "talking_points": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["contact_type", "purpose"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_order",
            "description": "Create a new customer order",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_name": {"type": "string"},
                    "items": {"type": "array", "items": {"type": "object"}},
                    "delivery_date": {"type": "string"},
                },
                "required": ["items"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "send_payment_reminder",
            "description": "Send a payment reminder call to a customer",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_name": {"type": "string"},
                    "invoice_number": {"type": "string"},
                    "amount": {"type": "number"},
                },
                "required": ["customer_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "schedule_appointment",
            "description": "Schedule or reschedule an appointment",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_name": {"type": "string"},
                    "appointment_type": {"type": "string"},
                    "date_time": {"type": "string"},
                    "duration_minutes": {"type": "integer"},
                },
                "required": ["appointment_type", "date_time"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_business_summary",
            "description": "Get a summary of current business metrics and status",
            "parameters": {
                "type": "object",
                "properties": {
                    "timeframe": {"type": "string", "enum": ["today", "this_week", "this_month"]},
                },
                "required": []
            }
        }
    },
]


class GrokService:
    """Service for interacting with xAI Grok API."""

    def __init__(self):
        if settings.GROQ_API_KEY:
            self.api_key = settings.GROQ_API_KEY
            self.base_url = settings.GROQ_API_BASE_URL
            self.model = settings.GROQ_MODEL
            self.provider = "groq"
        elif settings.XAI_API_KEY and settings.XAI_API_KEY.startswith("gsk_"):
            self.api_key = settings.XAI_API_KEY
            self.base_url = "https://api.groq.com/openai/v1"
            self.model = "openai/gpt-oss-120b"
            self.provider = "groq"
        elif settings.XAI_API_KEY:
            self.api_key = settings.XAI_API_KEY
            self.base_url = settings.XAI_API_BASE_URL
            self.model = settings.XAI_MODEL
            self.provider = "xai"
        else:
            self.api_key = None
            self.base_url = ""
            self.model = ""
            self.provider = "demo"
        self.is_available = bool(self.api_key)

    async def _make_request(
        self,
        messages: list,
        tools: Optional[list] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> dict:
        """Make a request to the LLM API (Groq / xAI)."""
        if not self.is_available:
            return self._demo_response(messages)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "BusinessVoiceAI/1.0",
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if tools:
            payload["tools"] = tools
            payload["tool_choice"] = "auto"

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            return response.json()

    def _demo_response(self, messages: list) -> dict:
        """Generate a demo response when API key is not available."""
        user_msg = messages[-1].get("content", "") if messages else ""
        return {
            "choices": [{
                "message": {
                    "role": "assistant",
                    "content": f"[DEMO MODE] I understood your instruction: '{user_msg[:100]}'. "
                              f"In production, I would analyze this request, identify the required actions, "
                              f"and execute them through connected business systems. "
                              f"Configure your xAI API key to enable real AI processing.",
                    "tool_calls": None,
                },
                "finish_reason": "stop",
            }],
            "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
        }

    async def parse_business_instruction(self, instruction: str, business_context: dict = None) -> dict:
        """Parse a natural language business instruction into structured actions."""
        system_prompt = """You are a business operations AI assistant. Your role is to:
1. Understand business instructions given in natural language.
2. Break them down into specific, actionable steps.
3. Use the available tools to execute each step.
4. Never assume data you don't have - ask for clarification if needed.
5. For consequential actions (payments, orders, cancellations), always recommend owner approval.

Business context will be provided. Use it to make informed decisions.
Always respond with a clear plan before executing actions."""

        context_msg = ""
        if business_context:
            context_msg = f"\n\nCurrent business context:\n{json.dumps(business_context, indent=2, default=str)}"

        messages = [
            {"role": "system", "content": system_prompt + context_msg},
            {"role": "user", "content": instruction},
        ]

        result = await self._make_request(messages, tools=BUSINESS_TOOLS)
        return self._process_response(result)

    async def analyze_transcript(self, transcript: list, purpose: str = None) -> dict:
        """Analyze a call transcript to extract insights."""
        system_prompt = """Analyze this call transcript and extract:
1. Summary of the conversation
2. Key points discussed
3. Action items identified
4. Customer sentiment (positive/neutral/negative)
5. Any entities mentioned (products, dates, amounts, etc.)
6. Call outcome (successful/escalated/callback_requested/unresolved)

Respond in JSON format."""

        transcript_text = "\n".join(
            [f"{msg.get('role', 'unknown')}: {msg.get('content', '')}" for msg in transcript]
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Purpose: {purpose or 'General'}\n\nTranscript:\n{transcript_text}"},
        ]

        result = await self._make_request(messages, temperature=0.3)
        response_text = result["choices"][0]["message"]["content"]

        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            return {
                "summary": response_text,
                "key_points": [],
                "action_items": [],
                "sentiment": "neutral",
                "entities": {},
                "outcome": "completed",
            }

    async def generate_agent_prompt(self, business_type: str, agent_type: str, custom_instructions: str = None) -> str:
        """Generate a system prompt for an AI voice agent."""
        messages = [
            {
                "role": "system",
                "content": "Generate a professional system prompt for an AI voice agent. "
                          "The prompt should define the agent's personality, capabilities, constraints, "
                          "and conversation guidelines. Make it specific to the business type and agent role. "
                          "Include safety guidelines: never make medical diagnoses, never promise unauthorized "
                          "discounts, always offer human escalation for complex issues."
            },
            {
                "role": "user",
                "content": f"Business type: {business_type}\nAgent role: {agent_type}\n"
                          f"Additional instructions: {custom_instructions or 'None'}"
            },
        ]

        result = await self._make_request(messages, temperature=0.7)
        return result["choices"][0]["message"]["content"]

    async def generate_business_insights(self, metrics: dict) -> list:
        """Generate AI-powered business insights from metrics data."""
        messages = [
            {
                "role": "system",
                "content": "You are a business analyst AI. Analyze the provided business metrics and generate "
                          "3-5 actionable insights. Each insight should have: title, description, severity "
                          "(info/warning/action_required), category, and suggested_action. "
                          "Be specific and practical. Distinguish between actual data and estimates. "
                          "Respond as a JSON array."
            },
            {
                "role": "user",
                "content": f"Business metrics:\n{json.dumps(metrics, indent=2, default=str)}"
            },
        ]

        result = await self._make_request(messages, temperature=0.5)
        response_text = result["choices"][0]["message"]["content"]

        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            return [{
                "title": "Analysis Available",
                "description": response_text[:200],
                "severity": "info",
                "category": "general",
                "suggested_action": "Review the full analysis for details."
            }]

    async def generate_call_context(self, purpose: str, customer_data: dict, business_data: dict) -> dict:
        """Generate context for a voice call using Grok."""
        messages = [
            {
                "role": "system",
                "content": "Generate a call context for an AI voice agent. Include: "
                          "1. Key talking points, 2. Important information to convey, "
                          "3. Questions to ask, 4. Escalation triggers. "
                          "Respond as JSON with keys: talking_points, information, questions, escalation_triggers."
            },
            {
                "role": "user",
                "content": f"Purpose: {purpose}\nCustomer: {json.dumps(customer_data, default=str)}\n"
                          f"Business context: {json.dumps(business_data, default=str)}"
            },
        ]

        result = await self._make_request(messages, temperature=0.5)
        response_text = result["choices"][0]["message"]["content"]

        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            return {
                "talking_points": [response_text[:200]],
                "information": {},
                "questions": [],
                "escalation_triggers": ["customer requests human agent"],
            }

    def _process_response(self, result: dict) -> dict:
        """Process Grok API response into structured output."""
        choice = result["choices"][0]
        message = choice["message"]

        response = {
            "content": message.get("content", ""),
            "tool_calls": [],
            "finish_reason": choice.get("finish_reason"),
        }

        if message.get("tool_calls"):
            for tc in message["tool_calls"]:
                response["tool_calls"].append({
                    "id": tc.get("id"),
                    "function": tc["function"]["name"],
                    "arguments": json.loads(tc["function"]["arguments"]) if isinstance(tc["function"]["arguments"], str) else tc["function"]["arguments"],
                })

        return response


# Singleton
grok_service = GrokService()
