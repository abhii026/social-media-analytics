"""
DevOrbit Database Migration:
1. Adds `sources` table to track public and test sources.
2. Adds `data_type` and `source_name` to `posts` table.
3. Migrates existing 6 posts to TEST_DATA.
4. Seeds configured public channels and test bot records.
"""

import os
import sys
from datetime import datetime, timezone
from pathlib import Path
import mysql.connector
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "devorbit_db")


def run_migration():
    print("Connecting to MySQL database...")
    conn = mysql.connector.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
    )
    cursor = conn.cursor()

    # 1. Create sources table
    print("1. Creating sources table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sources (
            source_id VARCHAR(50) NOT NULL,
            source_name VARCHAR(100) NOT NULL,
            platform VARCHAR(30) NOT NULL,
            channel_username VARCHAR(100) DEFAULT NULL,
            access_status VARCHAR(50) NOT NULL,
            data_type VARCHAR(20) NOT NULL,
            last_collected_message TEXT DEFAULT NULL,
            messages_collected INT DEFAULT 0,
            last_sync_time DATETIME DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (source_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    """)

    # 2. Check and alter posts table
    print("2. Checking columns on posts table...")
    cursor.execute("SHOW COLUMNS FROM posts LIKE 'data_type';")
    if not cursor.fetchone():
        cursor.execute("ALTER TABLE posts ADD COLUMN data_type VARCHAR(20) NOT NULL DEFAULT 'REAL_DATA';")
        print("   - Added data_type column.")
    else:
        print("   - data_type column already exists.")

    cursor.execute("SHOW COLUMNS FROM posts LIKE 'source_name';")
    if not cursor.fetchone():
        cursor.execute("ALTER TABLE posts ADD COLUMN source_name VARCHAR(100) DEFAULT NULL;")
        print("   - Added source_name column.")
    else:
        print("   - source_name column already exists.")

    # 3. Update existing posts to TEST_DATA
    print("3. Updating existing records to TEST_DATA...")
    cursor.execute("""
        UPDATE posts
        SET data_type = 'TEST_DATA', source_name = 'DevOrbit Ingestion Bot'
        WHERE data_type = 'REAL_DATA' OR source_name IS NULL;
    """)
    print(f"   - Updated {cursor.rowcount} post(s) to TEST_DATA.")

    # 4. Seed / upsert sources
    print("4. Upserting configured sources...")
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    sources = [
        (
            "telegram_public_tech",
            "TechCrunch News",
            "Telegram",
            "@techcrunch",
            "AUTHORIZATION_REQUIRED",
            "REAL_DATA",
            None,
            0,
            None,
        ),
        (
            "telegram_public_durov",
            "Durov Official",
            "Telegram",
            "@durov",
            "AUTHORIZATION_REQUIRED",
            "REAL_DATA",
            None,
            0,
            None,
        ),
        (
            "telegram_public_cyber",
            "Cyber Defense Updates",
            "Telegram",
            "@cybersecurity_news",
            "AUTHORIZATION_REQUIRED",
            "REAL_DATA",
            None,
            0,
            None,
        ),
        (
            "telegram_test_bot",
            "DevOrbit Ingestion Bot",
            "Telegram",
            "@devorbitanalytics_bot",
            "TEST_ONLY",
            "TEST_DATA",
            "Cybersecurity defense teams report a major threat attack on cloud servers.",
            6,
            now,
        ),
        (
            "x_api_adapter",
            "X (Twitter) Official API",
            "X",
            "@TwitterAPI",
            "NOT_CONNECTED",
            "REAL_DATA",
            None,
            0,
            None,
        ),
    ]

    for s in sources:
        cursor.execute("""
            INSERT INTO sources (source_id, source_name, platform, channel_username, access_status, data_type, last_collected_message, messages_collected, last_sync_time)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                source_name = VALUES(source_name),
                access_status = VALUES(access_status),
                data_type = VALUES(data_type),
                messages_collected = VALUES(messages_collected),
                last_collected_message = VALUES(last_collected_message),
                last_sync_time = VALUES(last_sync_time);
        """, s)
    print("   - Upserted 5 sources.")

    conn.commit()
    cursor.close()
    conn.close()
    print("Migration completed successfully!")


if __name__ == "__main__":
    run_migration()
