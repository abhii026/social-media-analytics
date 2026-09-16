"""
DevOrbit - Official Instagram Graph API Collector
Author: Abhishek (Data Engineer)

Collects real Instagram data from authorized Professional/Creator accounts
using the official Meta Graph API (v19.0).

STRICT COMPLIANCE RULES:
- No web scraping, no mock data, no synthetic JSON, no browser automation.
- Only official Meta Graph API endpoints.
- Server-side credentials only (INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_ACCOUNT_ID).
- If credentials are missing or permissions expired, sets access_status to
  'AUTHORIZATION_REQUIRED' in MySQL without generating fake records.
"""

import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
import requests
import mysql.connector
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")

if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

try:
    from analytics.processor import run_full_pipeline
except ImportError:
    run_full_pipeline = None

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "devorbit_db")

INSTAGRAM_ACCESS_TOKEN = os.getenv("INSTAGRAM_ACCESS_TOKEN", "").strip()
INSTAGRAM_ACCOUNT_ID = os.getenv("INSTAGRAM_ACCOUNT_ID", "").strip()
GRAPH_API_BASE = "https://graph.facebook.com/v19.0"


def get_db():
    return mysql.connector.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
    )


def mark_instagram_status(status: str, err_message: str = None):
    """Updates access_status in the sources table for the Instagram connector."""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE sources
            SET access_status = %s
            WHERE source_id = 'instagram_graph_api';
        """, (status,))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"[Instagram Collector] DB status update error: {e}")


def parse_meta_timestamp(ts_str: str) -> datetime:
    """Parses ISO 8601 timestamps returned by Meta Graph API (e.g. 2026-03-10T14:30:00+0000)."""
    try:
        # Normalize timezone offsets like +0000 to +00:00 for fromisoformat
        if ts_str.endswith("+0000"):
            ts_str = ts_str[:-5] + "+00:00"
        dt = datetime.fromisoformat(ts_str)
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    except Exception:
        return datetime.now(timezone.utc).replace(tzinfo=None)


def check_meta_credentials() -> bool:
    """Validates presence and format of server-side Meta API credentials."""
    if not INSTAGRAM_ACCESS_TOKEN or not INSTAGRAM_ACCOUNT_ID:
        print("==================================================================")
        print("[DevOrbit Ingestion] Instagram / Meta Graph API credentials missing.")
        print("To collect REAL data from an authorized Instagram Professional Account:")
        print("1. Log in to https://developers.facebook.com and create a Meta App.")
        print("2. Add 'Instagram Graph API' and link an Instagram Professional/Creator account.")
        print("3. Generate an Access Token with 'instagram_basic', 'instagram_manage_comments'.")
        print("4. Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_ACCOUNT_ID to your .env file.")
        print("5. Re-run this collector.")
        print("Status: Marking Instagram as 'AUTHORIZATION_REQUIRED' in MySQL.")
        print("==================================================================")
        mark_instagram_status("AUTHORIZATION_REQUIRED")
        return False
    return True


def collect_instagram_data() -> int:
    """
    Fetches real media posts and user comments from the authorized Instagram account
    via Meta Graph API, saves them to MySQL, and triggers analytics.
    """
    if not check_meta_credentials():
        return 0

    print(f"[Instagram Collector] Connecting to Meta Graph API for account {INSTAGRAM_ACCOUNT_ID}...")

    # 1. Fetch recent media for the account
    media_url = f"{GRAPH_API_BASE}/{INSTAGRAM_ACCOUNT_ID}/media"
    params = {
        "fields": "id,caption,media_type,permalink,timestamp,like_count,comments_count",
        "access_token": INSTAGRAM_ACCESS_TOKEN,
        "limit": 25,
    }

    try:
        resp = requests.get(media_url, params=params, timeout=15)
        data = resp.json()
    except requests.RequestException as e:
        print(f"[Instagram Collector] Network error connecting to Meta: {e}")
        mark_instagram_status("ERROR")
        return 0

    if "error" in data:
        err = data["error"]
        print(f"[Instagram Collector] Meta API Error: {err.get('message')} (Code: {err.get('code')})")
        if err.get("code") in (190, 102, 10):  # Invalid/expired token or permission error
            mark_instagram_status("AUTHORIZATION_REQUIRED")
        else:
            mark_instagram_status("ERROR")
        return 0

    media_items = data.get("data", [])
    if not media_items:
        print("[Instagram Collector] No media items returned from authorized account.")
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE sources
            SET access_status = 'CONNECTED', last_sync_time = %s
            WHERE source_id = 'instagram_graph_api';
        """, (now,))
        conn.commit()
        cursor.close()
        conn.close()
        return 0

    conn = get_db()
    cursor = conn.cursor()
    new_records_count = 0
    latest_text = None

    for item in media_items:
        media_id = item.get("id")
        caption = item.get("caption", "").strip()
        timestamp = parse_meta_timestamp(item.get("timestamp", ""))
        likes = item.get("like_count", 0)
        comments = item.get("comments_count", 0)

        # 1. Ingest media post if caption exists
        if caption:
            post_id = f"IG_{media_id}"
            latest_text = caption
            cursor.execute("""
                INSERT IGNORE INTO posts
                (post_id, platform, user_id, text, timestamp, likes, comments, shares, data_type, source_name)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            """, (
                post_id,
                "Instagram",
                f"IG_ACC_{INSTAGRAM_ACCOUNT_ID}",
                caption,
                timestamp,
                likes,
                comments,
                0,
                "REAL_DATA",
                "Instagram Professional Account",
            ))
            if cursor.rowcount > 0:
                new_records_count += 1
                print(f"   -> Ingested Instagram post {post_id}")

        # 2. Ingest comments on this media item (user discussions)
        if comments > 0:
            comments_url = f"{GRAPH_API_BASE}/{media_id}/comments"
            c_params = {
                "fields": "id,text,timestamp,username,like_count",
                "access_token": INSTAGRAM_ACCESS_TOKEN,
                "limit": 20,
            }
            try:
                c_resp = requests.get(comments_url, params=c_params, timeout=10)
                c_data = c_resp.json()
                for c_item in c_data.get("data", []):
                    c_id = c_item.get("id")
                    c_text = c_item.get("text", "").strip()
                    c_time = parse_meta_timestamp(c_item.get("timestamp", ""))
                    c_user = c_item.get("username", "user")
                    c_likes = c_item.get("like_count", 0)

                    if c_text:
                        comment_post_id = f"IG_C_{c_id}"
                        latest_text = c_text
                        cursor.execute("""
                            INSERT IGNORE INTO posts
                            (post_id, platform, user_id, text, timestamp, likes, comments, shares, data_type, source_name)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                        """, (
                            comment_post_id,
                            "Instagram",
                            f"IG_USER_{c_user}",
                            c_text,
                            c_time,
                            c_likes,
                            0,
                            0,
                            "REAL_DATA",
                            "Instagram Professional Account",
                        ))
                        if cursor.rowcount > 0:
                            new_records_count += 1
                            print(f"   -> Ingested Instagram comment {comment_post_id}")
            except Exception as c_err:
                print(f"[Instagram Collector] Error fetching comments for {media_id}: {c_err}")

    # Update sources table metadata
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    cursor.execute("""
        UPDATE sources
        SET access_status = 'CONNECTED',
            messages_collected = messages_collected + %s,
            last_collected_message = COALESCE(%s, last_collected_message),
            last_sync_time = %s
        WHERE source_id = 'instagram_graph_api';
    """, (new_records_count, latest_text[:500] if latest_text else None, now))
    conn.commit()

    cursor.close()
    conn.close()

    print(f"[Instagram Collector] Ingestion complete: {new_records_count} new record(s) saved.")

    # Trigger analytics pipeline if new records arrived
    if new_records_count > 0 and run_full_pipeline:
        print(f"[DevOrbit Analytics] Triggering analytics pipeline for {new_records_count} new Instagram record(s)...")
        run_full_pipeline()

    return new_records_count


def main():
    import argparse
    parser = argparse.ArgumentParser(description="DevOrbit Instagram Graph API Collector")
    parser.add_argument("--check", action="store_true", help="Check credentials and connectivity only")
    parser.add_argument("--once", action="store_true", help="Run once and exit")
    parser.add_argument("--interval", type=int, default=120, help="Sync interval in seconds (default: 120)")
    args = parser.parse_args()

    print("==================================================")
    print("DevOrbit: Instagram Social Media Collector")
    print("API: Meta Graph API (Official Endpoints Only)")
    print("Data Type: REAL_DATA")
    print("==================================================")

    if args.check:
        check_meta_credentials()
        return

    if args.once:
        collect_instagram_data()
        return

    while True:
        try:
            collect_instagram_data()
            if not INSTAGRAM_ACCESS_TOKEN or not INSTAGRAM_ACCOUNT_ID:
                print(f"[Instagram Collector] Sleeping 180s (waiting for Meta credentials in .env)...")
                time.sleep(180)
            else:
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\n[Instagram Collector] Stopped by user.")
            break
        except Exception as e:
            print(f"[Instagram Collector] Unexpected error: {e}")
            time.sleep(15)


if __name__ == "__main__":
    main()
