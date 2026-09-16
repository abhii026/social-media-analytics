"""
DevOrbit - Backend API Service
Social Media Analysis Platform

FastAPI REST API serving multi-source social media analytics, live feeds,
demographics, burst trends, and network graph to the dashboard.
"""

import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any

import mysql.connector
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware

# Ensure project root is available
PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / ".env")

if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from analytics.processor import generate_network_graph, run_full_pipeline

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "devorbit_db")

INSTAGRAM_WEBHOOK_VERIFY_TOKEN = os.getenv("INSTAGRAM_WEBHOOK_VERIFY_TOKEN", "devorbit_verify_token")

app = FastAPI(
    title="DevOrbit Social Media Analysis API",
    description="Real-Time Multi-Source Social Media Analytics, NLP, Trends & Network Graph API",
    version="1.0.0",
)

# Enable CORS for frontend dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    return mysql.connector.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
    )


# --- META / INSTAGRAM OFFICIAL WEBHOOK HANDLERS ---

@app.get("/api/webhook/instagram")
def verify_instagram_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token"),
):
    """
    Official Meta Webhook verification handshake.
    Validates hub.mode == 'subscribe' and hub.verify_token == configured token.
    Returns hub.challenge as plain text upon success.
    """
    if hub_mode == "subscribe" and hub_verify_token == INSTAGRAM_WEBHOOK_VERIFY_TOKEN:
        print(f"[Meta Webhook] Handshake verified successfully. Challenge: {hub_challenge}")
        return Response(content=hub_challenge or "", media_type="text/plain")
    print(f"[Meta Webhook] Verification failed. Token: {hub_verify_token}, Mode: {hub_mode}")
    raise HTTPException(status_code=403, detail="Verification token mismatch")


@app.post("/api/webhook/instagram")
async def receive_instagram_webhook(request: Request):
    """
    Official Meta Webhook event receiver.
    Receives real-time comments, mentions, and message events from Instagram.
    Validates, deduplicates, stores in MySQL, and triggers analytics.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    if payload.get("object") != "instagram":
        return Response(content="IGNORED_NON_INSTAGRAM", media_type="text/plain")

    entries = payload.get("entry", [])
    new_records = 0
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    conn = get_db()
    cursor = conn.cursor()

    for entry in entries:
        changes = entry.get("changes", [])
        for change in changes:
            field = change.get("field")
            val = change.get("value", {})
            change_id = val.get("id") or f"WH_{int(datetime.now(timezone.utc).timestamp())}"
            text = val.get("text", "").strip()

            if text:
                post_id = f"IG_WH_{change_id}"
                from_user = val.get("from", {}).get("username", "instagram_user")
                cursor.execute("""
                    INSERT IGNORE INTO posts
                    (post_id, platform, user_id, text, timestamp, likes, comments, shares, data_type, source_name)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, (
                    post_id,
                    "Instagram",
                    f"IG_USER_{from_user}",
                    text,
                    now,
                    0,
                    0,
                    0,
                    "REAL_DATA",
                    "Instagram Professional Account",
                ))
                if cursor.rowcount > 0:
                    new_records += 1

    if new_records > 0:
        cursor.execute("""
            UPDATE sources
            SET access_status = 'CONNECTED',
                messages_collected = messages_collected + %s,
                last_sync_time = %s
            WHERE source_id = 'instagram_graph_api';
        """, (new_records, now))
        conn.commit()

    cursor.close()
    conn.close()

    if new_records > 0 and run_full_pipeline:
        try:
            run_full_pipeline()
        except Exception as e:
            print(f"[Webhook Analytics Error] {e}")

    # Meta requires HTTP 200 within 20s
    return Response(content="EVENT_RECEIVED", media_type="text/plain")


@app.get("/api/health")
def health_check():
    """Returns system, database, and sources connectivity status."""
    db_status = "disconnected"
    total_posts = 0
    real_posts = 0
    test_posts = 0
    sources_count = 0
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT COUNT(*) as total FROM posts;")
        total_posts = cursor.fetchone()["total"]

        cursor.execute("SELECT data_type, COUNT(*) as count FROM posts GROUP BY data_type;")
        for r in cursor.fetchall():
            if r["data_type"] == "REAL_DATA":
                real_posts = r["count"]
            elif r["data_type"] == "TEST_DATA":
                test_posts = r["count"]

        cursor.execute("SELECT COUNT(*) as count FROM sources;")
        sources_count = cursor.fetchone()["count"]

        cursor.close()
        conn.close()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "service": "DevOrbit Social Media Analysis API",
        "database": db_status,
        "total_posts_stored": total_posts,
        "real_posts_count": real_posts,
        "test_posts_count": test_posts,
        "configured_sources_count": sources_count,
        "telegram_live_ingestion": "active",
        "telegram_public_collector": "installed (MTProto Client)",
        "instagram_status": "installed (Meta Graph API & Webhooks)",
        "x_api_status": "API-Ready / Inactive (Credit Required)",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/sources")
def get_sources():
    """
    Returns all configured public and test ingestion sources
    with real-time status and collected message counters.
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT
            source_id,
            source_name,
            platform,
            channel_username,
            access_status,
            data_type,
            last_collected_message,
            messages_collected,
            last_sync_time,
            created_at
        FROM sources
        ORDER BY
            CASE data_type WHEN 'REAL_DATA' THEN 1 ELSE 2 END,
            messages_collected DESC,
            source_name ASC;
    """)
    sources = cursor.fetchall()
    cursor.close()
    conn.close()

    for s in sources:
        if isinstance(s.get("last_sync_time"), datetime):
            s["last_sync_time"] = s["last_sync_time"].isoformat()
        if isinstance(s.get("created_at"), datetime):
            s["created_at"] = s["created_at"].isoformat()

    return {"sources": sources, "count": len(sources)}


@app.get("/api/overview")
def get_overview(
    scope: str = Query("all", regex="^(all|real|test)$"),
    platform: Optional[str] = Query(None, regex="^(Telegram|Instagram|X|All)$"),
):
    """
    Overview KPIs:
    - Total posts (filtered by scope: all | real | test, and platform: Telegram | Instagram | X | All)
    - Active sources (Telegram live, Instagram Graph API, X)
    - Sentiment counts (Positive, Negative, Neutral)
    - Top trending topic
    - Counts for real vs test posts
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # 1. Total counts breakdown by data_type
    cursor.execute("SELECT data_type, COUNT(*) as count FROM posts GROUP BY data_type;")
    type_rows = cursor.fetchall()
    real_count = sum(r["count"] for r in type_rows if r["data_type"] == "REAL_DATA")
    test_count = sum(r["count"] for r in type_rows if r["data_type"] == "TEST_DATA")

    # Scope & Platform WHERE clause
    conditions = []
    params = []
    if scope == "real":
        conditions.append("data_type = 'REAL_DATA'")
    elif scope == "test":
        conditions.append("data_type = 'TEST_DATA'")

    if platform and platform != "All":
        conditions.append("platform = %s")
        params.append(platform)

    where_sql = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    cursor.execute(f"SELECT platform, COUNT(*) as count FROM posts {where_sql} GROUP BY platform;", tuple(params))
    platform_rows = cursor.fetchall()
    total_posts = sum(r["count"] for r in platform_rows)

    # Active sources from sources table
    cursor.execute("SELECT source_id, source_name, platform, access_status, data_type, messages_collected FROM sources;")
    src_rows = cursor.fetchall()

    active_sources = []
    for s in src_rows:
        color = "#386641" if s["access_status"] == "CONNECTED" else "#B02A37" if s["access_status"] == "AUTHORIZATION_REQUIRED" else "#666666"
        active_sources.append({
            "source_id": s["source_id"],
            "platform": s["source_name"],
            "count": s["messages_collected"],
            "status": s["access_status"],
            "data_type": s["data_type"],
            "color": color,
        })

    # 2. Sentiment distribution for the selected scope & platform
    sent_conditions = []
    sent_params = []
    if scope == "real":
        sent_conditions.append("p.data_type = 'REAL_DATA'")
    elif scope == "test":
        sent_conditions.append("p.data_type = 'TEST_DATA'")

    if platform and platform != "All":
        sent_conditions.append("p.platform = %s")
        sent_params.append(platform)

    sent_where = ("WHERE " + " AND ".join(sent_conditions)) if sent_conditions else ""

    cursor.execute(f"""
        SELECT s.sentiment, COUNT(*) as count
        FROM sentiment_results s
        JOIN posts p ON s.post_id = p.post_id
        {sent_where}
        GROUP BY s.sentiment;
    """, tuple(sent_params))
    sentiment_rows = cursor.fetchall()
    sentiment_map = {"Positive": 0, "Negative": 0, "Neutral": 0}
    for r in sentiment_rows:
        if r["sentiment"] in sentiment_map:
            sentiment_map[r["sentiment"]] = r["count"]

    # 3. Top trending topic
    if total_posts == 0:
        top_trend = {"topic": "No posts collected yet", "keyword": "none", "mention_count": 0, "growth_rate": 0}
    else:
        cursor.execute("SELECT topic, keyword, mention_count, growth_rate FROM trend_results ORDER BY mention_count DESC LIMIT 1;")
        top_trend = cursor.fetchone() or {"topic": "None detected", "mention_count": 0, "growth_rate": 0}

    cursor.close()
    conn.close()

    return {
        "scope": scope,
        "platform": platform or "All",
        "total_posts": total_posts,
        "real_posts_count": real_count,
        "test_posts_count": test_count,
        "active_sources": active_sources,
        "sentiment_counts": sentiment_map,
        "top_trending_topic": top_trend,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/posts")
def get_posts(
    limit: int = Query(50, ge=1, le=200),
    platform: Optional[str] = Query(None, regex="^(Telegram|Instagram|X|All)$"),
    scope: str = Query("all", regex="^(all|real|test)$"),
):
    """Returns recent posts joined with sentiment, emotion, data_type, and source_name."""
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    conditions = []
    params = []

    if platform and platform != "All":
        conditions.append("p.platform = %s")
        params.append(platform)

    if scope == "real":
        conditions.append("p.data_type = 'REAL_DATA'")
    elif scope == "test":
        conditions.append("p.data_type = 'TEST_DATA'")

    where_sql = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    query = f"""
        SELECT
            p.post_id,
            p.platform,
            p.user_id,
            p.text,
            p.timestamp,
            p.likes,
            p.comments,
            p.shares,
            p.data_type,
            COALESCE(p.source_name, 'Unknown Source') AS source_name,
            COALESCE(s.sentiment, 'Unanalyzed') AS sentiment,
            COALESCE(s.emotion, 'Neutral') AS emotion,
            COALESCE(s.confidence, 0.5000) AS confidence,
            s.analyzed_at
        FROM posts p
        LEFT JOIN sentiment_results s ON p.post_id = s.post_id
        {where_sql}
        ORDER BY p.timestamp DESC LIMIT %s
    """
    params.append(limit)

    cursor.execute(query, tuple(params))
    posts = cursor.fetchall()

    cursor.close()
    conn.close()

    # Format datetime objects to ISO strings
    for p in posts:
        if isinstance(p["timestamp"], datetime):
            p["timestamp"] = p["timestamp"].isoformat()
        if isinstance(p.get("analyzed_at"), datetime):
            p["analyzed_at"] = p["analyzed_at"].isoformat()
        if p["confidence"] is not None:
            p["confidence"] = float(p["confidence"])

    return {"posts": posts, "count": len(posts), "scope": scope, "platform": platform or "All"}


@app.get("/api/sentiment")
def get_sentiment(
    scope: str = Query("all", regex="^(all|real|test)$"),
    platform: Optional[str] = Query(None, regex="^(Telegram|Instagram|X|All)$"),
):
    """
    Detailed sentiment & emotion breakdown + timeline data for charts,
    respecting scope ('all' | 'real' | 'test') and platform filter.
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    conditions = []
    params = []

    if scope == "real":
        conditions.append("p.data_type = 'REAL_DATA'")
    elif scope == "test":
        conditions.append("p.data_type = 'TEST_DATA'")

    if platform and platform != "All":
        conditions.append("p.platform = %s")
        params.append(platform)

    where_clause = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    # 1. Sentiment counts
    cursor.execute(f"""
        SELECT s.sentiment, COUNT(*) as count
        FROM sentiment_results s
        JOIN posts p ON s.post_id = p.post_id
        {where_clause}
        GROUP BY s.sentiment;
    """, tuple(params))
    sentiment_distribution = [
        {"name": r["sentiment"], "value": r["count"]}
        for r in cursor.fetchall()
    ]

    # 2. Emotion counts
    cursor.execute(f"""
        SELECT s.emotion, COUNT(*) as count
        FROM sentiment_results s
        JOIN posts p ON s.post_id = p.post_id
        {where_clause}
        GROUP BY s.emotion
        ORDER BY count DESC;
    """, tuple(params))
    emotion_distribution = cursor.fetchall()

    # 3. Timeline aggregation (by post timestamp hour/day)
    cursor.execute(f"""
        SELECT
            DATE_FORMAT(p.timestamp, '%Y-%m-%d %H:00') as time_bucket,
            SUM(CASE WHEN s.sentiment = 'Positive' THEN 1 ELSE 0 END) as positive,
            SUM(CASE WHEN s.sentiment = 'Negative' THEN 1 ELSE 0 END) as negative,
            SUM(CASE WHEN s.sentiment = 'Neutral' THEN 1 ELSE 0 END) as neutral
        FROM posts p
        JOIN sentiment_results s ON p.post_id = s.post_id
        {where_clause}
        GROUP BY time_bucket
        ORDER BY time_bucket ASC
        LIMIT 24;
    """, tuple(params))
    timeline_data = cursor.fetchall()

    cursor.close()
    conn.close()

    return {
        "scope": scope,
        "platform": platform or "All",
        "sentiment_distribution": sentiment_distribution,
        "emotion_distribution": emotion_distribution,
        "timeline": timeline_data,
    }


@app.get("/api/trends")
def get_trends(
    scope: str = Query("all", regex="^(all|real|test)$"),
    platform: Optional[str] = Query(None, regex="^(Telegram|Instagram|X|All)$"),
):
    """Returns top trending keywords, topics, mention counts and growth rates."""
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # If filtering by platform or scope, check if posts exist
    check_conditions = []
    check_params = []
    if scope == "real":
        check_conditions.append("data_type = 'REAL_DATA'")
    elif scope == "test":
        check_conditions.append("data_type = 'TEST_DATA'")

    if platform and platform != "All":
        check_conditions.append("platform = %s")
        check_params.append(platform)

    check_sql = ("WHERE " + " AND ".join(check_conditions)) if check_conditions else ""
    cursor.execute(f"SELECT COUNT(*) as count FROM posts {check_sql}", tuple(check_params))
    if cursor.fetchone()["count"] == 0:
        cursor.close()
        conn.close()
        return {"trends": [], "count": 0, "scope": scope, "platform": platform or "All"}

    cursor.execute("""
        SELECT trend_id, topic, keyword, mention_count, growth_rate, detected_at
        FROM trend_results
        ORDER BY mention_count DESC, growth_rate DESC
        LIMIT 20;
    """)
    trends = cursor.fetchall()
    cursor.close()
    conn.close()

    for t in trends:
        if isinstance(t["detected_at"], datetime):
            t["detected_at"] = t["detected_at"].isoformat()
        if t["growth_rate"] is not None:
            t["growth_rate"] = float(t["growth_rate"])

    return {"trends": trends, "count": len(trends), "scope": scope, "platform": platform or "All"}


@app.get("/api/demographics")
def get_demographics():
    """Returns aggregate anonymized demographic insights."""
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM demographics ORDER BY user_count DESC;")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    for r in rows:
        if isinstance(r["analyzed_at"], datetime):
            r["analyzed_at"] = r["analyzed_at"].isoformat()

    # Summarize language breakdown
    lang_summary = {}
    interest_summary = {}
    for r in rows:
        lang = r.get("language") or "Unknown"
        lang_summary[lang] = lang_summary.get(lang, 0) + r["user_count"]
        interest = r.get("professional_interest") or "General"
        interest_summary[interest] = interest_summary.get(interest, 0) + r["user_count"]

    languages = [{"language": k, "count": v} for k, v in lang_summary.items()]
    interests = [{"interest": k, "count": v} for k, v in interest_summary.items()]

    return {
        "demographics": rows,
        "languages": languages,
        "interests": interests,
    }


@app.get("/api/network")
def get_network(
    scope: str = Query("all", regex="^(all|real|test)$"),
    platform: Optional[str] = Query(None, regex="^(Telegram|Instagram|X|All)$"),
):
    """Generates and returns the NetworkX co-occurrence and influence graph."""
    try:
        graph_data = generate_network_graph(scope=scope, platform=platform)
        return graph_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NetworkX error: {str(e)}")


@app.post("/api/pipeline/run")
def trigger_pipeline():
    """Manually triggers the full analytics pipeline to process new data."""
    try:
        run_full_pipeline()
        return {
            "status": "success",
            "message": "Analytics pipeline executed successfully",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("BACKEND_HOST", "0.0.0.0")
    port = int(os.getenv("BACKEND_PORT", "8000"))
    print(f"Starting DevOrbit Backend API on {host}:{port}...")
    uvicorn.run("backend.main:app", host=host, port=port, reload=False)
