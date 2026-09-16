import duckdb
import os

# ============================================================
# NEXUS - X 2026 Dataset
# Extract 100,000 useful X posts
# ============================================================

OUTPUT_DIR = "data/x/processed"
OUTPUT_FILE = f"{OUTPUT_DIR}/nexus_x_100k.parquet"

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("=" * 60)
print("NEXUS - X 2026 Dataset Extraction")
print("=" * 60)

# Hugging Face dataset
SOURCE = (
    "hf://datasets/"
    "SinclairSchneider/tweets_sample_2026/"
    "data/*.parquet"
)

query = f"""
COPY (
    SELECT
        CAST(id AS VARCHAR) AS post_id,

        'x' AS platform,

        'reference_2026' AS source_type,

        CAST(profile_id AS VARCHAR) AS author_id,

        CAST(date AS TIMESTAMP) AS created_at,

        text AS text,

        username AS username,

        name AS author_name,

        search_term AS search_term,

        link AS post_url,

        "external-link" AS external_link,

        "replying-to" AS replying_to,

        comments AS reply_count,

        retweets AS repost_count,

        quotes AS like_count,

        likes AS view_count,

        pictures AS pictures,

        videos AS videos,

        gifs AS gifs,

        "is-retweet" AS is_retweet,

        "is-pinned" AS is_pinned,

        'SinclairSchneider/tweets_sample_2026'
            AS source_dataset,

        CAST(id AS VARCHAR)
            AS source_record_id

    FROM read_parquet('{SOURCE}')

    WHERE
        date >= '2026-01-01'
        AND date < '2026-07-28'

        AND text IS NOT NULL

        AND LENGTH(TRIM(text)) >= 30

        AND LENGTH(TRIM(text)) <= 5000

        AND "is-retweet" = FALSE

    USING SAMPLE reservoir(100000 ROWS)
)
TO '{OUTPUT_FILE}'
(FORMAT PARQUET);
"""

try:

    print("\nReading 2026 X dataset...")
    print("Filtering useful original posts...")
    print("Selecting 100,000 records...")
    print("\nPlease wait...\n")

    duckdb.sql(query)

    print("=" * 60)
    print("SUCCESS")
    print("=" * 60)

    # Verify output
    result = duckdb.sql(
        f"""
        SELECT COUNT(*)
        FROM '{OUTPUT_FILE}'
        """
    ).fetchone()

    print(f"\nRecords extracted: {result[0]:,}")
    print(f"Output file: {OUTPUT_FILE}")

except Exception as e:

    print("=" * 60)
    print("ERROR")
    print("=" * 60)

    print(str(e))