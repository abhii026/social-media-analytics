# DevOrbit — Social Media Analysis Platform

**Product:** Social Media Analysis  
**Engineering:** DevOrbit  
**Branch:** `abhishek-de`  

---

## 1. Product Overview

DevOrbit Social Media Analysis is a real-time multi-source social intelligence and sentiment analytics platform. It ingests public online discussions across official APIs, processes text for sentiment polarity and emotional tone, detects velocity-growing topics, aggregates demographic indicators without collecting PII, constructs topic-entity interaction topologies with NetworkX, and presents verified intelligence in a clean, human-designed analytics dashboard.

---

## 2. Architecture

```text
[ Telegram MTProto / Bot ]       [ Instagram Graph API & Webhooks ]       [ X Official API Adapter ]
           ↓                                      ↓                                    ↓
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        Data Ingestion & Verification Engine                            │
│                  - Deterministic deduplication (post_id)                               │
│                  - Data Classification: REAL_DATA vs. TEST_DATA                        │
│                  - Official Webhook Handshake (hub.challenge / hub.verify_token)       │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                           ↓
                                    MySQL Database
                     (posts, sentiment_results, trend_results, sources)
                                           ↓
                               Analytics Engine (Python)
                     - VADER Sentiment Polarity & Confidence
                     - Discrete Emotion Classification
                     - TF-IDF Topic Velocity & Growth Rates
                     - NetworkX Co-occurrence & Influence Topology
                                           ↓
                                  FastAPI Backend API
                     - REST Endpoints with Scope & Platform Slicers
                     - Official Meta Webhook GET & POST Handlers
                     - Manual Pipeline Trigger & Health Probes
                                           ↓
                             React Dashboard (TypeScript)
                     - Vite + Tailwind CSS + Recharts
                     - Platform Filtering (All, Telegram, Instagram, X)
                     - Light / Dark Mode + Real-Time Live Ingestion
```

---

## 3. Implementation & Data Source Status

| Source / Component | Implementation Status | Details |
| :--- | :--- | :--- |
| **Telegram Public Channels** | **IMPLEMENTED** | Telegram MTProto Client (`telethon`) for authorized public channel collection. |
| **Telegram Bot Ingestion** | **IMPLEMENTED + TESTED** | Real-time long polling via Bot API (`TEST_DATA` pipeline verification). |
| **Instagram Official API** | **IMPLEMENTED (Meta Graph API & Webhooks)** | Official Meta Graph API v19.0 collector + `/api/webhook/instagram` verification & event ingestion. Zero mock/fake data; reports `AUTHORIZATION_REQUIRED` until credentials supplied. |
| **MySQL Storage** | **IMPLEMENTED** | Relational schema with `data_type` flags (`REAL_DATA`, `TEST_DATA`) and source tracking. |
| **Analytics Engine** | **WORKING** | VADER sentiment scoring, discrete emotion mapping, topic burst detection, NetworkX graph. |
| **Backend API** | **WORKING** | FastAPI REST endpoints with CORS, multi-platform filtering, and webhook endpoints. |
| **Analytics Dashboard** | **WORKING** | Human-designed presentation UI with capsule pill headers, crisp borders, and zero AI neon glow. |
| **X (Twitter) Integration** | **API-READY / INACTIVE** | Official live X API adapter ready. Awaiting developer credits. No fake data used. |

---

## 4. Setup & Installation

### Prerequisites
- Python 3.12+
- MySQL 8.0+
- Node.js 18+ & npm

### Setup Steps
1. **Clone the repository and switch to branch:**
   ```bash
   git checkout abhishek-de
   ```
2. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and fill in your MySQL and Telegram Bot credentials:
   ```bash
   cp .env.example .env
   ```
3. **Set up Python Virtual Environment:**
   ```bash
   python -m venv .venv
   .venv\Scripts\pip install -r requirements.txt
   .venv\Scripts\pip install fastapi uvicorn networkx
   ```
4. **Initialize Database Tables:**
   Execute `data-engineering/sql/schema.sql` in your MySQL database:
   ```bash
   mysql -u root -p devorbit_db < data-engineering/sql/schema.sql
   ```
5. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

---

## 5. How to Run the Project

Open 3 terminal windows:

### Terminal 1: Backend API
```powershell
.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*API Swagger Documentation: `http://127.0.0.1:8000/docs`*

### Terminal 2: Frontend Dashboard
```powershell
cd frontend
cmd /c npm run dev
```
*Dashboard: `http://localhost:3000`*

### Terminal 3: Telegram Live Ingestion
```powershell
.venv\Scripts\python.exe data-engineering/ingestion/telegram_ingest.py
```

---

## 6. Detailed Documentation

For a comprehensive breakdown of file-by-file inputs/outputs, data flows, mentor interview questions, and spoken demo script, see:
[`docs/ABHISHEK_DATA_DASHBOARD.md`](docs/ABHISHEK_DATA_DASHBOARD.md)
