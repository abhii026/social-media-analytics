"""
DevOrbit - Authorized Telegram Public Channel Ingestion Collector
Problem Statement ID: 26152 | NTRO
Author: Abhishek (Data Engineer)

Collects real, public social-media messages created by other users from
configured public Telegram channels (@techcrunch, @cybersecurity_news, etc.).

ARCHITECTURE NOTE:
- Telegram Bot API CANNOT read arbitrary public channels without admin rights.
- This module uses the official Telegram MTProto Client API (Telethon).
- Developer credentials (TELEGRAM_API_ID & TELEGRAM_API_HASH) from https://my.telegram.org
  are required for authorized client connections.
- If credentials are not configured, this collector marks sources as
  'AUTHORIZATION_REQUIRED' in MySQL without generating fake or scraped data.
"""

import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
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

TELEGRAM_API_ID = os.getenv("TELEGRAM_API_ID", "").strip()
TELEGRAM_API_HASH = os.getenv("TELEGRAM_API_HASH", "").strip()


def get_db():
    return mysql.connector.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
    )


def mark_sources_authorization_required():
    """Sets public telegram channels to AUTHORIZATION_REQUIRED status in MySQL."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE sources
        SET access_status = 'AUTHORIZATION_REQUIRED'
        WHERE platform = 'Telegram' AND data_type = 'REAL_DATA';
    """)
    conn.commit()
    cursor.close()
    conn.close()


def get_configured_public_sources():
    """Retrieves configured public Telegram channels from MySQL."""
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT source_id, source_name, channel_username, access_status
        FROM sources
        WHERE platform = 'Telegram' AND data_type = 'REAL_DATA';
    """)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows


def ingest_public_channels():
    """
    Connects to Telegram via MTProto API and collects recent messages
    from configured public channels.
    """
    if not TELEGRAM_API_ID or not TELEGRAM_API_HASH:
        print("==================================================================")
        print("[DevOrbit Ingestion] TELEGRAM_API_ID or TELEGRAM_API_HASH is missing.")
        print("To collect REAL public data from public Telegram channels:")
        print("1. Log in to https://my.telegram.org with your phone number.")
        print("2. Click 'API development tools' to obtain api_id and api_hash.")
        print("3. Add TELEGRAM_API_ID and TELEGRAM_API_HASH to your .env file.")
        print("4. Re-run this collector.")
        print("Status: Marking public sources as 'AUTHORIZATION_REQUIRED' in MySQL.")
        print("==================================================================")
        mark_sources_authorization_required()
        return 0

    try:
        from telethon.sync import TelegramClient
        from telethon.tl.types import Channel
    except ImportError:
        print("[DevOrbit Ingestion] Telethon is not installed. Please run: pip install telethon")
        return 0

    sources = get_configured_public_sources()
    if not sources:
        print("[DevOrbit Ingestion] No public Telegram channels configured in `sources` table.")
        return 0

    session_path = str(PROJECT_ROOT / "data-engineering" / "ingestion" / "devorbit_session")
    client = TelegramClient(session_path, int(TELEGRAM_API_ID), TELEGRAM_API_HASH)

    print(f"[DevOrbit Ingestion] Connecting to Telegram MTProto API...")
    try:
        client.start()
    except Exception as e:
        print(f"[DevOrbit Ingestion] Telegram client authentication error: {e}")
        print("Please authenticate or verify your credentials.")
        mark_sources_authorization_required()
        return 0

    total_new_messages = 0
    conn = get_db()
    cursor = conn.cursor()

    for src in sources:
        username = src.get("channel_username")
        source_id = src.get("source_id")
        source_name = src.get("source_name")

        if not username:
            continue

        print(f"\n[DevOrbit Ingestion] Ingesting from public channel: {username} ({source_name})...")
        try:
            entity = client.get_entity(username)
            messages = client.get_messages(entity, limit=25)

            new_for_source = 0
            latest_message_text = None

            for msg in reversed(messages):
                if not msg.message or not msg.message.strip():
                    continue

                post_id = f"TG_PUB_{username.replace('@', '')}_{msg.id}"
                text = msg.message.strip()
                latest_message_text = text

                # Clean UTC timestamp
                msg_time = msg.date.replace(tzinfo=None) if msg.date else datetime.now(timezone.utc).replace(tzinfo=None)
                shares = getattr(msg, "forwards", 0) or 0
                replies_obj = getattr(msg, "replies", None)
                comments = replies_obj.replies if replies_obj else 0

                cursor.execute("""
                    INSERT IGNORE INTO posts
                    (post_id, platform, user_id, text, timestamp, likes, comments, shares, data_type, source_name)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, (
                    post_id,
                    "Telegram",
                    f"PUB_BROADCAST_{username}",
                    text,
                    msg_time,
                    shares,
                    comments,
                    shares,
                    "REAL_DATA",
                    source_name,
                ))

                if cursor.rowcount > 0:
                    new_for_source += 1
                    total_new_messages += 1

            now = datetime.now(timezone.utc).replace(tzinfo=None)
            # Update source metadata
            cursor.execute("""
                UPDATE sources
                SET access_status = 'CONNECTED',
                    messages_collected = messages_collected + %s,
                    last_collected_message = COALESCE(%s, last_collected_message),
                    last_sync_time = %s
                WHERE source_id = %s;
            """, (new_for_source, latest_message_text[:500] if latest_message_text else None, now, source_id))
            conn.commit()

            print(f"   -> {new_for_source} new public message(s) ingested from {username}.")

        except Exception as err:
            print(f"   -> Could not ingest from {username}: {err}")
            cursor.execute("""
                UPDATE sources
                SET access_status = 'AUTHORIZATION_REQUIRED'
                WHERE source_id = %s;
            """, (source_id,))
            conn.commit()

    cursor.close()
    conn.close()
    client.disconnect()

    # Trigger analytics pipeline if any new public messages arrived
    if total_new_messages > 0 and run_full_pipeline:
        print(f"\n[DevOrbit Analytics] Triggering full analytics on {total_new_messages} new public message(s)...")
        run_full_pipeline()

    return total_new_messages


def main():
    import argparse
    parser = argparse.ArgumentParser(description="DevOrbit Telegram Public Channel Collector")
    parser.add_argument("--once", action="store_true", help="Run once and exit")
    parser.add_argument("--interval", type=int, default=60, help="Sync interval in seconds (default: 60)")
    args = parser.parse_args()

    print("==================================================")
    print("DevOrbit: Public Social Media Ingestion Collector")
    print("Source: Configured Public Telegram Channels")
    print("Data Type: REAL_DATA")
    print("==================================================")

    if args.once:
        ingest_public_channels()
        return

    while True:
        try:
            ingest_public_channels()
            if not TELEGRAM_API_ID or not TELEGRAM_API_HASH:
                # Do not spam loop if credentials missing
                print(f"[DevOrbit Ingestion] Sleeping for 120s (credentials pending in .env)...")
                time.sleep(120)
            else:
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\n[DevOrbit Ingestion] Stopped by user.")
            break
        except Exception as e:
            print(f"[DevOrbit Ingestion] Error: {e}")
            time.sleep(10)


if __name__ == "__main__":
    main()
