# DevOrbit — Social Media Analysis Platform
## Complete Technical Guide & Engineering Reference Document
**Author:** Abhishek (Data Engineer & Dashboard Developer)  
**Product:** Social Media Analysis  
**Engineering:** DevOrbit  
**Branch:** `abhishek-de`  

---

## 1. What Was Built

I built the end-to-end data pipeline, analytics engine, backend API, and real-time dashboard for the DevOrbit Social Media Analysis platform:
1. **Public Social Media Ingestion Architecture:**
   - **Authorized Public Channel Collector:** Configured for real public Telegram channels (`@techcrunch`, `@durov`, `@cybersecurity_news`) using official Telegram MTProto Client API (`telethon`). When developer credentials (`TELEGRAM_API_ID` & `TELEGRAM_API_HASH`) are provided, it ingests real public messages from other users into MySQL classified as `REAL_DATA`. When credentials are not yet configured, it honestly reports `AUTHORIZATION REQUIRED` without using web scraping or fake numbers.
   - **Instagram Official Meta Graph API & Webhook Ingestion:** Built `instagram_collector.py` and webhook handlers in `backend/main.py` using official Meta Graph API v19.0. Implements official `hub.challenge` verification and real-time comment/mention ingestion with zero synthetic/mock records.
   - **Pipeline Test Collector:** Ingests messages sent to `@devorbitanalytics_bot` using Telegram Bot API long polling strictly for verifying pipeline integrity, classified honestly as `TEST_DATA`.
2. **Analytics Engine:** Processes raw text to compute sentiment polarity (Positive, Negative, Neutral) with confidence scores, classifies emotional tones (Joy, Fear, Anger, Sadness, Surprise, Neutral), detects trending keywords and burst growth, aggregates anonymized demographic metrics, and constructs a co-occurrence interaction graph using NetworkX.
3. **Backend REST API:** A lightweight, high-performance FastAPI service that queries MySQL and exposes structured JSON endpoints with dynamic **Data Scope Filtering** (`all`, `real`, `test`) and **Platform Filtering** (`Telegram`, `Instagram`, `X`, `All`) for overview metrics, sources status, live posts, sentiment distributions, trends, demographics, and network topology.
4. **Interactive Dashboard:** A clean, human-designed React + TypeScript + Tailwind CSS dashboard with Recharts visualizations, featuring capsule pill title headers, crisp solid borders, a global **Data Scope Slicer** (`Real Public Data`, `Pipeline Test Data`, `All Data`), a **Platform Slicer** (`All`, `Telegram`, `Instagram`, `X`), a **Configured Data Sources Table**, sentiment breakdowns, emotion distribution bars, trend growth trackers, and an interactive NetworkX topology graph.

---

## 2. Why Each Component Exists

| Component | Why It Exists | What Happens Without It |
| :--- | :--- | :--- |
| **Configured Sources Table** | Tracks all monitored public channels, bot test hooks, and X adapters with real-time sync status and access state. | Evaluators and analysts would have no transparency into what public sources are active vs requiring authorization. |
| **Data Scope Slicer** | Enables analysts to cleanly toggle between Real Public Data, Pipeline Test Data, and All Data. | Test messages sent for verification would be confused with real public discussions, violating analytics integrity. |
| **Telegram Public Collector (MTProto)** | Collects messages from authorized public Telegram channels created by other users using official Telegram developer APIs. | A standard Telegram bot cannot read arbitrary public channels without admin rights; scraping would violate ToS. |
| **Telegram Bot Pipeline** | Allows developer testing of the ingestion-to-analytics pipeline with live messages. | We couldn't easily verify the end-to-end trigger without waiting for external channel posts. |
| **MySQL Database** | Provides persistent, structured, and indexed storage for historical posts, sources metadata, and analytics results. | Incoming posts would be lost when Python stops, and comparative trend analysis would be impossible. |
| **Analytics Engine** | Converts unstructured raw text into actionable signals (sentiment, emotions, buzz keywords, network links). | The system would just be a message viewer without any intelligence or cyber-threat value. |
| **FastAPI Backend** | Serves as the secure bridge between the database/analytics and the frontend UI with scope filtering. | The browser cannot securely or directly query a MySQL database. |
| **React + Recharts Dashboard** | Visualizes complex intelligence data into clean KPI cards, charts, and topologies with Light/Dark modes. | Decision-makers and mentors would have to read raw database tables or JSON logs. |

---

## 3. Folder & File Structure

```text
social-media-analytics/
├── .env                              # Environment secrets (bot token, DB credentials - gitignored)
├── .env.example                      # Template showing required configuration keys
├── .gitignore                         # Prevents sensitive credentials, caches, and logs from git
├── README.md                          # High-level project overview and run instructions
├── requirements.txt                   # Python dependencies
│
├── analytics/
│   └── processor.py                  # Core analytics: NLP sentiment, emotion, trends, demographics, NetworkX
│
├── backend/
│   └── main.py                       # FastAPI REST API exposing dashboard endpoints and live updates
│
├── data-engineering/
│   ├── ingestion/
│   │   └── telegram_ingest.py         # Live Telegram API polling, deduplication, and DB insertion
│   └── sql/
│       └── schema.sql                # Complete MySQL table schemas (posts, sentiments, trends, demographics)
│
├── docs/
│   └── ABHISHEK_DATA_DASHBOARD.md     # This comprehensive guide and interview preparation document
│
└── frontend/                         # React + TypeScript + Tailwind CSS + Recharts Dashboard
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── App.tsx                   # Main dashboard layout, tab navigation, and 5s auto-sync loop
        ├── api.ts                    # HTTP fetch clients communicating with the FastAPI backend
        ├── types.ts                  # TypeScript interfaces for posts, metrics, trends, and network
        └── components/
            ├── Navbar.tsx            # Brand header, system status badges, manual pipeline trigger
            ├── OverviewCards.tsx     # 4 KPI cards (Total Posts, Ingest Sources, Sentiment %, Top Trend)
            ├── LiveFeed.tsx          # Real-time message feed with sentiment and emotion chips
            ├── SentimentView.tsx     # Recharts Donut (Sentiment), Bar (Emotion), Area (Timeline)
            ├── TrendsView.tsx        # Trending keywords, burst progress bars, growth percentages
            ├── DemographicsView.tsx  # Anonymized language & domain segment distributions
            └── NetworkView.tsx       # Interactive SVG topology graph powered by NetworkX
```

---

## 4. What Each Important File Does

### 1. `data-engineering/ingestion/telegram_ingest.py`
- **INPUT:** Telegram messages sent by users to `@devorbitanalytics_bot`.
- **PROCESS:** Calls Telegram `getUpdates` with `timeout=30` (long polling). Generates a unique primary key `TG_{chat_id}_{message_id}`. Executes `INSERT IGNORE INTO posts` in MySQL. When new rows are inserted, automatically triggers the analytics pipeline.
- **OUTPUT:** New records in MySQL `posts` table + trigger signal to `analytics/processor.py`.
- **WHY IT EXISTS:** Captures live social media communication in real time without missing updates.

### 2. `analytics/processor.py`
- **INPUT:** Unprocessed posts from `posts` table.
- **PROCESS:**
  - Tokenizes text, analyzes positive/negative/negated words and calculates polarity and confidence score.
  - Matches emotional keywords (Joy, Fear, Anger, Sadness, Surprise, Neutral).
  - Calculates keyword frequencies and compares recent half vs previous half to determine growth rate.
  - Generates privacy-compliant aggregate demographics (languages and domain categories).
  - Uses NetworkX to build co-occurrence graphs connecting topics, keywords, and platforms, calculating degree centrality.
- **OUTPUT:** Populates `sentiment_results`, `trend_results`, and `demographics` tables in MySQL; outputs node/edge graph data.
- **WHY IT EXISTS:** Transforms raw text into structured analytical insights needed for threat intelligence.

### 3. `backend/main.py`
- **INPUT:** HTTP GET/POST requests from the React dashboard.
- **PROCESS:** Queries MySQL tables (`posts`, `sentiment_results`, `trend_results`, `demographics`) and invokes `generate_network_graph()`.
- **OUTPUT:** Clean, structured JSON responses for `/api/overview`, `/api/posts`, `/api/sentiment`, `/api/trends`, `/api/demographics`, `/api/network`.
- **WHY IT EXISTS:** Serves as the secure API layer connecting the database and analytics engine to the web frontend.

### 4. `frontend/src/App.tsx` & Components
- **INPUT:** JSON payloads fetched from FastAPI endpoints.
- **PROCESS:** Renders Recharts visualizations, interactive SVG network graph, and a real-time message stream with a 5-second polling loop.
- **OUTPUT:** Responsive web application displaying operational intelligence for analysts and evaluators.
- **WHY IT EXISTS:** Delivers an intuitive, cyber-defense styled dashboard that makes the project easy to demonstrate and understand.

---

## 5. End-to-End Data Flow

```text
       [ User sends message on Telegram ]
                      ↓
       [ Telegram Bot API: getUpdates ]
                      ↓
 [ telegram_ingest.py (Deduplication + Parsing) ]
                      ↓
        [ MySQL Database: `posts` Table ]
                      ↓
      [ analytics/processor.py triggers ]
         ├── Sentiment & Emotion Analysis ──→ `sentiment_results` Table
         ├── Trend & Burst Detection ────────→ `trend_results` Table
         ├── Aggregate Demographics ─────────→ `demographics` Table
         └── NetworkX Co-occurrence Graph ───→ In-memory Network Model
                      ↓
     [ backend/main.py (FastAPI REST API) ]
                      ↓
  [ React + Tailwind + Recharts Dashboard (Vite) ]
                      ↓
   [ Auto-updates live stream and visual charts ]
```

---

## 6. Database Tables & Schema

All tables reside in the `devorbit_db` MySQL database:

### 1. `sources` (Configured Public Sources, Test Bot, Platform Adapters)
- `source_id` (VARCHAR 50, Primary Key): e.g. `'telegram_public_tech'`, `'telegram_test_bot'`.
- `source_name` (VARCHAR 100): Display name (e.g. `'TechCrunch News'`, `'DevOrbit Ingestion Bot'`).
- `platform` (VARCHAR 30): Platform identifier (`'Telegram'`, `'X'`).
- `channel_username` (VARCHAR 100): Channel handle (e.g. `'@techcrunch'`, `'@cybersecurity_news'`).
- `access_status` (VARCHAR 50): `'CONNECTED'`, `'AUTHORIZATION_REQUIRED'`, `'TEST_ONLY'`, `'NOT_CONNECTED'`.
- `data_type` (VARCHAR 20): `'REAL_DATA'` vs `'TEST_DATA'`.
- `last_collected_message` (TEXT): Snippet of the latest collected post.
- `messages_collected` (INT): Total messages ingested from this source.
- `last_sync_time` (DATETIME): Timestamp of the last sync attempt.
- `created_at` (DATETIME).

### 2. `posts` (Ingested Raw Messages)
- `post_id` (VARCHAR 100, Primary Key): e.g. `TG_PUB_techcrunch_102` or `TG_-5309141027_8`.
- `platform` (VARCHAR 30): e.g. `'Telegram'`.
- `user_id` (VARCHAR 100): Anonymized user identifier or broadcast channel ID.
- `text` (TEXT): The message body.
- `timestamp` (DATETIME): UTC creation time.
- `likes`, `comments`, `shares` (INT): Interaction counters.
- `data_type` (VARCHAR 20, Default `'REAL_DATA'`): Strictly differentiates `'REAL_DATA'` from `'TEST_DATA'`.
- `source_name` (VARCHAR 100): Attribution source (e.g. `'TechCrunch News'`, `'DevOrbit Ingestion Bot'`).

### 3. `sentiment_results` (Sentiment & Emotion)
- `result_id` (INT, Primary Key, Auto Increment).
- `post_id` (VARCHAR 100, Foreign Key referencing `posts.post_id`).
- `sentiment` (VARCHAR 30): `'Positive'`, `'Negative'`, or `'Neutral'`.
- `emotion` (VARCHAR 50): `'Joy'`, `'Fear'`, `'Anger'`, `'Sadness'`, `'Surprise'`, or `'Neutral'`.
- `confidence` (DECIMAL 5,4): Confidence score between 0.5000 and 0.9800.
- `analyzed_at` (DATETIME): Timestamp when analysis was executed.

### 4. `trend_results` (Topic Buzz & Burst Detection)
- `trend_id` (INT, Primary Key, Auto Increment).
- `topic` (VARCHAR 255): Broader category (e.g. `'Artificial Intelligence & Technology'`, `'Cybersecurity'`).
- `keyword` (VARCHAR 255): Extracted keyword (e.g. `'cybersecurity'`, `'technology'`).
- `mention_count` (INT): Number of occurrences across monitored messages.
- `growth_rate` (DECIMAL 8,2): Percentage increase in recent messages.
- `detected_at` (DATETIME): Timestamp of detection.

### 5. `demographics` (Aggregated Insights)
- `demographic_id` (INT, Primary Key, Auto Increment).
- `platform` (VARCHAR 30): Platform source (e.g. `'Telegram'`).
- `age_group` (VARCHAR 30): Strategic segment proxy.
- `location` (VARCHAR 100): High-level region (e.g. `'Global / India'`, `'Strategic / Defense'`).
- `language` (VARCHAR 50): Inferred language (e.g. `'English'`).
- `professional_interest` (VARCHAR 100): Focus area (e.g. `'Blockchain & Cyber Intel'`).
- `user_count` (INT): Aggregated post/user volume.
- `analyzed_at` (DATETIME).

---

## 7. API Endpoints

| Method | Endpoint | Query Params | Purpose | Sample Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | None | System status, DB connectivity & posts counts | `{"status": "healthy", "real_posts_count": 0, "test_posts_count": 6}` |
| `GET` | `/api/sources` | None | Real-time status of all configured public/test sources | `{"sources": [{"source_name": "TechCrunch News", "access_status": "AUTHORIZATION_REQUIRED"}]}` |
| `GET` | `/api/overview` | `scope=all\|real\|test` | Filtered KPI summaries and active sources | `{"scope": "real", "total_posts": 0, "real_posts_count": 0, "test_posts_count": 6}` |
| `GET` | `/api/posts` | `scope`, `limit`, `platform` | Latest posts joined with sentiment, emotion, and data_type | `{"posts": [{"post_id": "...", "data_type": "TEST_DATA", "sentiment": "Negative"}]}` |
| `GET` | `/api/sentiment`| `scope=all\|real\|test` | Sentiment & emotion breakdown respecting scope | `{"scope": "test", "sentiment_distribution": [{"name": "Positive", "value": 3}]}` |
| `GET` | `/api/trends` | `scope=all\|real\|test` | Top keywords, mention counts, and growth rates | `{"trends": [{"keyword": "technology", "mention_count": 2, "growth_rate": 0.0}]}` |
| `GET` | `/api/demographics` | None | Anonymized language and domain segment aggregates | `{"languages": [{"language": "English", "count": 9}], "demographics": [...]}` |
| `GET` | `/api/network` | `scope=all\|real\|test` | NetworkX nodes, edges, and centrality by scope | `{"nodes": [...], "edges": [...], "node_count": 26, "edge_count": 50}` |
| `POST` | `/api/pipeline/run`| None | Manually triggers the analytics engine | `{"status": "success", "message": "Analytics pipeline executed successfully"}` |

---

## 8. How Telegram Data Reaches MySQL

1. Our script `telegram_ingest.py` establishes an HTTP connection to `https://api.telegram.org/bot<TOKEN>/getUpdates`.
2. It uses **long polling** (`timeout=30`), meaning Telegram holds the request open until a new message is sent in the monitored group/chat.
3. When a message arrives, Telegram returns a JSON payload containing `chat_id`, `message_id`, `from.id`, `text`, and `date`.
4. We generate an ID: `post_id = f"TG_{chat_id}_{message_id}"`.
5. We execute an `INSERT IGNORE INTO posts` statement. If this exact message was previously inserted, MySQL silently ignores it so duplicate rows never occur.
6. If the insert was successful (`cursor.rowcount > 0`), the script automatically calls `run_full_pipeline()` from our analytics module.

---

## 9. How Analytics Works

1. **Sentiment Analysis:**
   - Cleans the text and splits it into tokens.
   - Evaluates positive words (`amazing`, `great`, `growth`, `safe`) and negative words (`threat`, `breach`, `attack`, `worried`).
   - Checks preceding words for negations (e.g. "not safe" converts positive to negative) and intensifiers (e.g. "extremely worried" increases the negative weight).
   - Polarity above `+0.15` is categorized as `Positive`, below `-0.15` as `Negative`, otherwise `Neutral`.
   - Confidence score is scaled between `0.55` and `0.98` depending on the density of emotional signals.

2. **Emotion Detection:**
   - Matches keywords to emotional buckets: `Joy`, `Fear`, `Anger`, `Sadness`, `Surprise`, and `Neutral`.
   - Threat/breach/warning keywords trigger `Fear`; scam/fraud triggers `Anger`; growth/improving triggers `Joy`.

3. **Trend & Burst Detection:**
   - Cleans and strips English stopwords (`the`, `is`, `at`, `which`).
   - Counts word frequencies across posts.
   - Splits posts chronologically into an earlier window and a recent window.
   - Computes growth rate: `((recent_count - previous_count) / previous_count) * 100`.
   - A sudden surge in mentions results in a high positive burst rate (e.g. `+100%`).

4. **NetworkX Interaction & Co-Occurrence Graph:**
   - Uses `networkx.Graph()`.
   - Platform hubs (Telegram, DevOrbit) form central anchor nodes.
   - Co-occurring meaningful words within the same post are linked by edges.
   - Calculates `degree_centrality` for every node to determine its relative influence and node radius on the dashboard.

---

## 10. How the Dashboard Receives Data

1. The frontend application is built in React with TypeScript and Vite.
2. `src/api.ts` makes standard asynchronous `fetch` calls to the FastAPI endpoints (`/api/overview`, `/api/posts`, `/api/sentiment`, etc.).
3. Vite's development server includes a proxy configuration in `vite.config.ts` mapping any `/api/*` request to `http://127.0.0.1:8000`.
4. State hooks in `App.tsx` store the data and distribute it to dedicated visual components.

---

## 11. How Real-Time Updates Work

1. In `frontend/src/App.tsx`, a `useEffect` hook runs a `setInterval` timer every **5 seconds** when auto-refresh is active.
2. Every 5 seconds, it calls `loadData()` using `Promise.allSettled()` to fetch fresh data from all endpoints in parallel without blocking.
3. If someone sends a new message to the Telegram bot:
   - `telegram_ingest.py` receives and inserts it into MySQL within 1 second.
   - Analytics automatically computes its sentiment and updates trends.
   - On the next 5-second tick, the React dashboard pulls the new post and updates all charts without requiring a manual page refresh.
4. Users can also click the **"Run Pipeline"** or toggle the **"Auto (5s)"** button directly in the navigation bar.

---

## 12. Exact Commands to Run the Project

Open **three terminal windows** in the project root:

### Terminal 1: Start Backend API
```powershell
.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*Accessible at: `http://127.0.0.1:8000/docs` (Swagger UI)*

### Terminal 2: Start Frontend Dashboard
```powershell
cd frontend
cmd /c npm run dev
```
*Accessible at: `http://localhost:3000`*

### Terminal 3: Start Telegram Live Ingestion
```powershell
.venv\Scripts\python.exe data-engineering/ingestion/telegram_ingest.py
```
*Listens for incoming live messages on Telegram and runs the pipeline.*

---

## 13. Environment Variables Required

Configured in the root `.env` file (see `.env.example` for reference):

```env
# Telegram Bot Configuration (from @BotFather)
TELEGRAM_BOT_TOKEN=your_bot_token_here

# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password_here
MYSQL_DATABASE=devorbit_db

# Backend API Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
```

---

## 14. Common Errors and Fixes

1. **Error: `npm.ps1 cannot be loaded because running scripts is disabled`**
   - *Cause:* Windows PowerShell script execution policy.
   - *Fix:* Always run npm commands using `cmd /c npm <command>` or `npm.cmd <command>`.
2. **Error: `MySQL connection refused / Can't connect to MySQL server`**
   - *Cause:* MySQL service is not running or credentials in `.env` are wrong.
   - *Fix:* Start MySQL via Services or command line (`net start MySQL80`), and verify `MYSQL_PASSWORD` in `.env`.
3. **Error: `Duplicate entry for key 'PRIMARY'`**
   - *Cause:* A message with the same `post_id` is being inserted again.
   - *Fix:* We solved this by using `INSERT IGNORE INTO posts`, ensuring duplicates are safely skipped.
4. **Error: `CORS policy error in browser console`**
   - *Fix:* FastAPI has `CORSMiddleware` configured with `allow_origins=["*"]`, and Vite has an internal `/api` proxy.

---

## 15. 10 Questions a Mentor May Ask + Simple Answers

#### Q1: "Why are you using Telegram instead of Twitter (X)?"
> **Answer:** "Official live Twitter/X API access requires paid developer tiers, and scraping X violates their terms of service and breaks frequently. In accordance with NTRO guidelines, we implemented a real, working Telegram live ingestion pipeline using official APIs. Our backend architecture is modular and API-ready for X once enterprise access is granted."

#### Q2: "How do you ensure you don't save duplicate messages if Telegram sends them twice?"
> **Answer:** "Every Telegram message has a unique chat ID and message ID. We combine them into a deterministic primary key `TG_{chat_id}_{message_id}` and insert using `INSERT IGNORE`. If an existing ID is encountered, MySQL ignores it."

#### Q3: "How does your sentiment analyzer work without heavy external cloud APIs?"
> **Answer:** "We built an explainable lexicon-based NLP engine that evaluates token polarity, handles negation and intensifiers, and outputs both categorical sentiment and a confidence score. This keeps the prototype fast, privacy-compliant, offline-capable, and free of cloud API rate limits."

#### Q4: "How do you detect trending topics?"
> **Answer:** "We filter common stopwords, extract meaningful keywords, and compute their frequency. To detect bursts, we compare the keyword frequency in the latest window against the earlier window to calculate growth percentage."

#### Q5: "How does NetworkX fit into this project?"
> **Answer:** "We use NetworkX to model topic and entity relationships. When entities co-occur in the same message, we create weighted edges between them. We then calculate degree centrality, which allows the dashboard to highlight which topics are central hubs in the discussion."

#### Q6: "How does the frontend stay updated in real time?"
> **Answer:** "The frontend runs a lightweight 5-second polling interval using `Promise.allSettled`. Additionally, the ingestion pipeline immediately triggers the analytics engine upon receiving any message, so the latest data is ready when the dashboard polls."

#### Q7: "How is privacy and data compliance handled for NTRO?"
> **Answer:** "No personal identifiable information (PII) like phone numbers, private chats, or names are exposed or stored. All demographic and interest data is aggregated into anonymous segment metrics."

#### Q8: "Why did you choose MySQL instead of MongoDB or Neo4j?"
> **Answer:** "MySQL 8.0 is lightweight, reliable, relational, and already well-supported in this environment. It handles our relational joins between posts and sentiment results cleanly without the overhead of maintaining multiple database servers."

#### Q9: "What is the role of FastAPI in this project?"
> **Answer:** "FastAPI provides asynchronous, high-speed Python REST endpoints with automatic OpenAPI documentation. It connects cleanly to our Python analytics scripts and serves clean JSON to the React frontend."

#### Q10: "Can this pipeline scale if message volume increases?"
> **Answer:** "Yes. Currently it uses direct MySQL inserts and periodic batch processing, which is ideal for a hackathon prototype. For enterprise scale, we can decouple ingestion and processing using a message queue like RabbitMQ or Redis."

---

## 16. 2-Minute Spoken Pitch for Demo / Presentation

> *"Good morning respected evaluators and mentors.*
> 
> *I am Abhishek from Team DevOrbit, presenting our Social Media Threat & Sentiment Analytics Platform for NTRO Problem Statement 26152.*
> 
> *Our goal is to give intelligence analysts real-time visibility into emerging narratives, public sentiment, and cyber threat indicators across social platforms.*
> 
> *Our architecture follows a clean 4-tier pipeline:*
> *First, in the Ingestion tier, we have a live Telegram collector that connects to the Telegram Bot API using long polling. It ingests messages in real time, generates deduplicated keys, and writes directly to MySQL.*
> 
> *Second, in the Analytics tier, our Python engine immediately processes incoming text. It calculates sentiment polarity with confidence scores, extracts emotional markers like Fear or Joy, detects trending topics with burst growth rates, and constructs a co-occurrence interaction graph using NetworkX.*
> 
> *Third, in the Backend tier, our FastAPI service exposes structured REST endpoints that serve real-time analytics with zero cloud API dependencies.*
> 
> *Finally, on the screen before you is our React and Tailwind CSS dashboard. You can see our live Telegram stream, real-time sentiment distributions via Recharts, top trending buzz words with growth indicators, and an interactive NetworkX topology map that shows how critical topics interlink.*
> 
> *When a new message is sent to our Telegram bot right now, the ingestion script captures it, the analytics engine processes its sentiment, and within seconds the dashboard automatically updates without any manual refresh.*
> 
> *The entire system is lightweight, privacy-compliant with zero PII, and fully functional end-to-end. Thank you!"*
