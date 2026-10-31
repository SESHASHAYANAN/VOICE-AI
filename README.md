# Voice AI - Business Voice Operating System

> **A full-stack AI voice-agent platform that empowers businesses to automate complex operations through customizable AI phone calls, intelligent voice workflows, and automated action execution.**

---

## 🌟 Overview

**Voice AI** is a complete Business Voice Operating System tailored for Indian SMBs, D2C brands, healthcare, hotels, and retail. Unlike basic conversational chatbots, Voice AI connects intelligence directly to real business operations:

- **Autonomous Voice Agents**: Deploy inbound & outbound phone agents powered by **Bolna AI**.
- **Real-Time NLU & Function Calling**: Powered by **Groq** high-speed inference engine for natural language instruction parsing into structured business operations.
- **Action Execution Engine**: Directly checks inventory, issues purchase orders, reschedules deliveries, manages appointments, and issues payment reminders.
- **Multi-Tenant Architecture**: Organization-scoped agents, customer directories, order pipelines, call analytics, and audit logging.
- **Enterprise-Ready**: Fast response times, webhook streaming, JWT authentication, and zero-config local database support (SQLite / PostgreSQL).

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Web & Voice UI                       │
└───────────────────────────┬────────────────────────────┘
                            │ REST / Webhook
┌───────────────────────────▼────────────────────────────┐
│              FastAPI Application Server                │
│                                                        │
│  ┌──────────────────┐           ┌───────────────────┐  │
│  │   Auth & Orgs    │           │  Agent Management │  │
│  └──────────────────┘           └───────────────────┘  │
│  ┌──────────────────┐           ┌───────────────────┐  │
│  │  Operations API  │           │ Webhooks Handler  │  │
│  └──────────────────┘           └───────────────────┘  │
└──────────────┬─────────────────────────┬───────────────┘
               │                         │
     Function Calling & NLU       Telephony & Voice
               │                         │
┌──────────────▼──────┐           ┌──────▼───────────────┐
│     Groq LLM        │           │   Bolna AI Platform  │
│ (openai/gpt-oss,    │           │  (Voice Synthesis,   │
│  qwen, llama models)│           │   Telephony, Calls)  │
└─────────────────────┘           └──────────────────────┘
```

---

## 🚀 Key Features

### 1. Business Voice Agents
- **Customizable Personas**: Tailor agent tone, speed, vocabulary, greetings, and multilingual prompts.
- **Call Scenarios**:
  - Customer Support & FAQ
  - Delivery Rescheduling & Order Tracking
  - Supplier Reorders & Stock Inquiries
  - Patient & Client Appointment Reminders
  - Overdue Payment Follow-ups

### 2. Intelligent Tool Calling (Groq Brain)
- Maps conversational intent to structured execution schemas:
  - `check_inventory(product_name)`
  - `create_purchase_order(product_name, quantity, supplier_name)`
  - `reschedule_delivery(order_id, new_date)`
  - `initiate_call(contact_type, purpose)`
  - `send_payment_reminder(customer_name, invoice_number, amount)`

### 3. Voice Telephony Integration (Bolna Voice)
- Real-time outbound call dispatching via `POST /call`.
- Webhook callbacks for call completion, call duration, recordings, and transcription analytics.

---

## 📦 Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy 2.0 (Async), Pydantic v2
- **Database**: SQLite (local zero-config with `aiosqlite`) or PostgreSQL (production)
- **Voice Platform**: Bolna AI (`api.bolna.ai`)
- **LLM Engine**: Groq Cloud API (`api.groq.com/openai/v1`)
- **Deployment**: Docker, Uvicorn, Docker Compose

---

## 🛠️ Quickstart Guide

### 1. Clone & Setup

```bash
git clone https://github.com/SESHASHAYANAN/VOICE-AI.git
cd VOICE-AI
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Add your API keys in `.env`:

```env
GROQ_API_KEY=your_groq_api_key
BOLNA_API_KEY=your_bolna_api_key
BOLNA_API_BASE_URL=https://api.bolna.ai
```

### 3. Run Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Interactive API documentation will be available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🔒 Security & Privacy

- All API keys and environment configurations are excluded from version control via `.gitignore`.
- Role-based access control (Owner, Admin, Manager, Member) with JWT authentication.
- Strict input validation with Pydantic schemas.

---

## 📄 License

MIT License. Built for the Bolna Hackathon.
