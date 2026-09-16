"""
NEXUS Data Pipeline - Main Cleaning & Transformation Pipeline
Implements end-to-end extraction, filtering, deduplication, normalization,
multiprocessed language detection, entity extraction, author anonymization,
schema alignment, and Parquet persistence.
"""

import os
import sys
import time
from datetime import datetime, timezone
from multiprocessing import Pool, cpu_count
from typing import Any, Dict, List, Tuple

import duckdb
import pyarrow as pa
import pyarrow.parquet as pq

from src.data_pipeline.anonymization import anonymize_id, anonymize_username
from src.data_pipeline.normalization import (
    compute_content_hash,
    detect_language_batch,
    extract_entities,
    init_detector,
    normalize_media,
)
from src.data_pipeline.validation import validate_cleaned_dataset


def run_pipeline(
    input_file: str = "data/x/processed/nexus_x_100k.parquet",
    output_file: str = "data/x/processed/nexus_x_cleaned.parquet",
    report_file: str = "data/x/validation/x_cleaning_report.json",
    num_workers: int = 0,
) -> Dict[str, Any]:
    """
    Execute the complete NEXUS X data cleaning and normalization pipeline.
    """
    start_time = time.time()
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    os.makedirs(os.path.dirname(report_file), exist_ok=True)

    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file does not exist: {input_file}")

    print("=" * 70)
    print("NEXUS X DATA CLEANING & NORMALIZATION PIPELINE")
    print("=" * 70)
    print(f"Input File : {input_file}")
    print(f"Output File: {output_file}")
    print(f"Report File: {report_file}")

    con = duckdb.connect()

    # 1. Inspect source metrics and count exclusions
    print("\n[Stage 1/6] Inspecting input records and calculating exclusion metrics...")
    input_records = con.execute(f"SELECT COUNT(*) FROM read_parquet('{input_file}')").fetchone()[0]

    # Exclusions
    removed_null_post_id = con.execute(
        f"SELECT COUNT(*) FROM read_parquet('{input_file}') WHERE post_id IS NULL OR TRIM(CAST(post_id AS VARCHAR)) = ''"
    ).fetchone()[0]

    removed_null_text = con.execute(
        f"SELECT COUNT(*) FROM read_parquet('{input_file}') WHERE text IS NULL OR TRIM(CAST(text AS VARCHAR)) = ''"
    ).fetchone()[0]

    removed_short_text = con.execute(
        f"SELECT COUNT(*) FROM read_parquet('{input_file}') WHERE text IS NOT NULL AND LENGTH(TRIM(CAST(text AS VARCHAR))) < 10"
    ).fetchone()[0]

    removed_long_text = con.execute(
        f"SELECT COUNT(*) FROM read_parquet('{input_file}') WHERE text IS NOT NULL AND LENGTH(TRIM(CAST(text AS VARCHAR))) > 5000"
    ).fetchone()[0]

    excluded_retweets = con.execute(
        f"SELECT COUNT(*) FROM read_parquet('{input_file}') WHERE is_retweet IS TRUE"
    ).fetchone()[0]

    # Check timestamp validity: null or out of realistic historical context [2006-01-01 to 2026-07-28]
    removed_invalid_timestamp = con.execute(f"""
        SELECT COUNT(*) FROM read_parquet('{input_file}')
        WHERE created_at IS NULL
           OR created_at < '2006-01-01'
           OR created_at > '2026-07-28'
    """).fetchone()[0]

    # Check duplicates count
    dupes_query = f"""
        SELECT COUNT(*) - COUNT(DISTINCT post_id)
        FROM read_parquet('{input_file}')
        WHERE post_id IS NOT NULL AND TRIM(CAST(post_id AS VARCHAR)) != ''
          AND text IS NOT NULL
          AND LENGTH(TRIM(CAST(text AS VARCHAR))) >= 10
          AND LENGTH(TRIM(CAST(text AS VARCHAR))) <= 5000
          AND (is_retweet IS FALSE OR is_retweet IS NULL)
          AND created_at IS NOT NULL
          AND created_at >= '2006-01-01'
          AND created_at <= '2026-07-28'
    """
    removed_duplicate_post_id = con.execute(dupes_query).fetchone()[0]

    print(f"  Total Input Records        : {input_records:,}")
    print(f"  Removed Null Post IDs      : {removed_null_post_id}")
    print(f"  Removed Null/Blank Texts   : {removed_null_text}")
    print(f"  Removed Short Texts (<10)  : {removed_short_text}")
    print(f"  Removed Long Texts (>5000) : {removed_long_text}")
    print(f"  Excluded Retweets          : {excluded_retweets:,}")
    print(f"  Invalid/Future Timestamps  : {removed_invalid_timestamp}")
    print(f"  Duplicate Post IDs Removed : {removed_duplicate_post_id}")

    # 2. SQL Filtering & Deduplication in DuckDB
    print("\n[Stage 2/6] Executing DuckDB SQL filtering and deduplication...")
    base_cleaned_query = f"""
        WITH filtered AS (
            SELECT
                CAST(post_id AS VARCHAR) AS post_id,
                CAST(author_id AS VARCHAR) AS author_id,
                CAST(username AS VARCHAR) AS raw_username,
                CAST(created_at AS TIMESTAMPTZ) AS created_at,
                TRIM(REGEXP_REPLACE(CAST(text AS VARCHAR), '\\s+', ' ', 'g')) AS text,

                -- Safe non-negative BIGINT engagement metrics mapping
                COALESCE(GREATEST(CAST(like_count AS BIGINT), 0), 0) AS like_count,
                COALESCE(GREATEST(CAST(repost_count AS BIGINT), 0), 0) AS repost_count,
                COALESCE(GREATEST(CAST(reply_count AS BIGINT), 0), 0) AS reply_count,
                COALESCE(GREATEST(CAST(view_count AS BIGINT), 0), 0) AS view_count,

                pictures,
                videos,
                gifs,

                CAST(source_record_id AS VARCHAR) AS source_record_id

            FROM read_parquet('{input_file}')
            WHERE post_id IS NOT NULL AND TRIM(CAST(post_id AS VARCHAR)) != ''
              AND text IS NOT NULL
              AND LENGTH(TRIM(CAST(text AS VARCHAR))) >= 10
              AND LENGTH(TRIM(CAST(text AS VARCHAR))) <= 5000
              AND (is_retweet IS FALSE OR is_retweet IS NULL)
              AND created_at IS NOT NULL
              AND created_at >= '2006-01-01'
              AND created_at <= '2026-07-28'
        ),
        deduplicated AS (
            SELECT *
            FROM filtered
            QUALIFY ROW_NUMBER() OVER (
                PARTITION BY post_id
                ORDER BY created_at ASC
            ) = 1
        )
        SELECT * FROM deduplicated ORDER BY created_at ASC
    """

    base_table = con.execute(base_cleaned_query).arrow().read_all()
    num_clean = base_table.num_rows
    con.close()
    print(f"  Retained after SQL filtering & dedup: {num_clean:,} records")

    # 3. Multiprocessed Language Detection
    if num_workers <= 0:
        num_workers = min(10, cpu_count() or 4)

    print(f"\n[Stage 3/6] Running language detection with {num_workers} parallel worker processes...")
    texts = base_table.column("text").to_pylist()
    chunk_size = 500
    chunks = [texts[i : i + chunk_size] for i in range(0, len(texts), chunk_size)]

    t_lang_0 = time.time()
    with Pool(processes=num_workers, initializer=init_detector) as pool:
        chunk_results = pool.map(detect_language_batch, chunks)
    t_lang_1 = time.time()

    lang_results = [item for sublist in chunk_results for item in sublist]
    languages = [r[0] for r in lang_results]
    language_confidences = [r[1] for r in lang_results]
    print(f"  Completed language detection in {t_lang_1 - t_lang_0:.2f}s ({len(texts)/(t_lang_1 - t_lang_0):.1f} texts/s)")

    # 4. Entity Extraction, Content Hashing, Media Normalization, Author Anonymization
    print("\n[Stage 4/6] Extracting entities, computing content hashes, and anonymizing authors...")
    author_ids = base_table.column("author_id").to_pylist()
    raw_usernames = base_table.column("raw_username").to_pylist()
    pictures_col = base_table.column("pictures").to_pylist()
    videos_col = base_table.column("videos").to_pylist()
    gifs_col = base_table.column("gifs").to_pylist()

    hashtags_list: List[List[str]] = []
    mentions_list: List[List[str]] = []
    urls_list: List[List[str]] = []
    content_hashes: List[str] = []
    author_id_hashes: List[Any] = []
    author_username_hashes: List[Any] = []
    media_types: List[str] = []
    media_urls_list: List[List[str]] = []

    for i in range(num_clean):
        txt = texts[i]
        ht, mt, ul = extract_entities(txt)
        hashtags_list.append(ht)
        mentions_list.append(mt)
        urls_list.append(ul)

        content_hashes.append(compute_content_hash(txt))
        author_id_hashes.append(anonymize_id(author_ids[i]))
        author_username_hashes.append(anonymize_username(raw_usernames[i]))

        m_type, m_urls = normalize_media(pictures_col[i], videos_col[i], gifs_col[i])
        media_types.append(m_type)
        media_urls_list.append(m_urls)

    # 5. Assemble NEXUS Unified Schema Table
    print("\n[Stage 5/6] Assembling NEXUS unified PyArrow schema...")
    now_utc = datetime.now(timezone.utc)
    ingestion_timestamps = [now_utc] * num_clean
    processed_ats = [now_utc] * num_clean

    final_table = pa.Table.from_arrays(
        [
            base_table.column("post_id"),
            pa.array(["x"] * num_clean, pa.string()),
            pa.array(["historical_public"] * num_clean, pa.string()),

            pa.array(author_id_hashes, pa.string()),
            pa.array(author_username_hashes, pa.string()),

            base_table.column("created_at"),

            base_table.column("text"),
            pa.array(languages, pa.string()),
            pa.array(language_confidences, pa.float32()),
            pa.array(content_hashes, pa.string()),

            # Relational links (NULL for this dataset as specified)
            pa.array([None] * num_clean, pa.string()),  # conversation_id
            pa.array([None] * num_clean, pa.string()),  # reply_to_post_id
            pa.array([None] * num_clean, pa.string()),  # quoted_post_id
            pa.array([None] * num_clean, pa.string()),  # reposted_post_id

            # Entities
            pa.array(hashtags_list, pa.list_(pa.string())),
            pa.array(mentions_list, pa.list_(pa.string())),
            pa.array(urls_list, pa.list_(pa.string())),

            # Engagement
            base_table.column("like_count"),
            base_table.column("repost_count"),
            base_table.column("reply_count"),
            base_table.column("view_count"),
            pa.array([None] * num_clean, pa.int64()),   # quote_count

            # Media
            pa.array(media_types, pa.string()),
            pa.array(media_urls_list, pa.list_(pa.string())),

            # Provenance
            pa.array(["SinclairSchneider/tweets_sample_2026"] * num_clean, pa.string()),
            base_table.column("source_record_id"),

            pa.array(ingestion_timestamps, pa.timestamp("us", tz="UTC")),
            pa.array(processed_ats, pa.timestamp("us", tz="UTC")),
            pa.array(["1.0"] * num_clean, pa.string()),
        ],
        names=[
            "post_id",
            "platform",
            "source_type",
            "author_id_hash",
            "author_username_hash",
            "created_at",
            "text",
            "language",
            "language_confidence",
            "content_hash",
            "conversation_id",
            "reply_to_post_id",
            "quoted_post_id",
            "reposted_post_id",
            "hashtags",
            "mentions",
            "urls",
            "like_count",
            "repost_count",
            "reply_count",
            "view_count",
            "quote_count",
            "media_type",
            "media_urls",
            "source_dataset",
            "source_record_id",
            "ingestion_timestamp",
            "processed_at",
            "schema_version",
        ],
    )

    print(f"  Writing cleaned dataset to: {output_file}...")
    pq.write_table(final_table, output_file, compression="snappy")
    file_size = os.path.getsize(output_file)
    print(f"  Successfully wrote {final_table.num_rows:,} records ({file_size:,} bytes).")

    # 6. Quality Validation & Report Generation
    print("\n[Stage 6/6] Validating output dataset and generating quality report...")
    filter_metrics = {
        "input_records": input_records,
        "removed_null_post_id": removed_null_post_id,
        "removed_null_text": removed_null_text,
        "removed_short_text": removed_short_text,
        "removed_long_text": removed_long_text,
        "removed_invalid_timestamp": removed_invalid_timestamp,
        "removed_duplicate_post_id": removed_duplicate_post_id,
        "excluded_retweets": excluded_retweets,
    }

    report = validate_cleaned_dataset(output_file, filter_metrics, report_file)
    total_time = time.time() - start_time
    print(f"\nPipeline execution finished in {total_time:.2f} seconds.")
    print(f"Quality Report generated: {report_file}")
    print(f"Pipeline Status: {report.get('pipeline_status')}")

    return report
