import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
import mysql.connector
from dotenv import load_dotenv

# Load .env from project root
PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")

# Ensure project root is on sys.path so analytics module can be imported
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

try:
    from analytics.processor import run_full_pipeline
except ImportError:
    run_full_pipeline = None

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "devorbit_db")

if not TELEGRAM_BOT_TOKEN:
    raise ValueError("TELEGRAM_BOT_TOKEN is missing from .env")

if not MYSQL_PASSWORD:
    raise ValueError("MYSQL_PASSWORD is missing from .env")


TELEGRAM_URL = (
    f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates"
)


def connect_mysql():
    return mysql.connector.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
    )


def save_message(message):
    chat_id = message["chat"]["id"]
    message_id = message["message_id"]

    post_id = f"TG_{chat_id}_{message_id}"

    user = message.get("from", {})
    user_id = str(user.get("id", ""))

    text = message.get("text", "")

    if not text:
        return False

    timestamp = datetime.fromtimestamp(
        message["date"], tz=timezone.utc
    ).replace(tzinfo=None)

    connection = connect_mysql()
    cursor = connection.cursor()

    query = """
        INSERT IGNORE INTO posts
        (post_id, platform, user_id, text, timestamp, likes, comments, shares, data_type, source_name)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    values = (
        post_id,
        "Telegram",
        user_id,
        text,
        timestamp,
        0,
        0,
        0,
        "TEST_DATA",
        "DevOrbit Ingestion Bot",
    )

    cursor.execute(query, values)
    inserted = cursor.rowcount > 0

    if inserted:
        # Update sources table for test bot
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        cursor.execute("""
            UPDATE sources
            SET messages_collected = messages_collected + 1,
                last_collected_message = %s,
                last_sync_time = %s,
                access_status = 'TEST_ONLY'
            WHERE source_id = 'telegram_test_bot';
        """, (text[:500], now))

    connection.commit()
    cursor.close()
    connection.close()

    if inserted:
        print(f"New Telegram test message saved: {post_id}")
        print(f"Text: {text}")
        return True
    return False


def main():
    print("Telegram live ingestion started...")
    print("Waiting for new messages...")

    offset = 0

    while True:
        try:
            response = requests.get(
                TELEGRAM_URL,
                params={
                    "offset": offset,
                    "timeout": 30,
                },
                timeout=35,
            )

            data = response.json()

            if not data.get("ok"):
                print("Telegram API error:", data)
                time.sleep(5)
                continue

            new_messages_count = 0
            for update in data["result"]:
                offset = update["update_id"] + 1

                message = update.get("message")

                if message:
                    if save_message(message):
                        new_messages_count += 1

            # Automatically run analytics pipeline on newly arrived messages
            if new_messages_count > 0 and run_full_pipeline:
                try:
                    print(f"Triggering analytics pipeline for {new_messages_count} new message(s)...")
                    run_full_pipeline()
                except Exception as analytics_err:
                    print("Analytics pipeline error:", analytics_err)

        except requests.RequestException as error:
            print("Telegram connection error:", error)
            time.sleep(5)

        except mysql.connector.Error as error:
            print("MySQL error:", error)
            time.sleep(5)

        except Exception as error:
            print("Unexpected error:", error)
            time.sleep(5)


if __name__ == "__main__":
    main()