"""
NEXUS Data Pipeline - Quality Validation & Reporting Module
Performs comprehensive quality checks on cleaned dataset and generates
the standardized x_cleaning_report.json.
"""

import os
import json
from typing import Any, Dict
import duckdb
import pyarrow.parquet as pq

REQUIRED_COLUMNS = [
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
]


def validate_cleaned_dataset(
    output_file: str,
    filter_metrics: Dict[str, Any],
    report_path: str,
) -> Dict[str, Any]:
    """
    Validate output Parquet file against NEXUS quality criteria and generate JSON report.
    """
    if not os.path.exists(output_file):
        raise FileNotFoundError(f"Cleaned output file not found: {output_file}")

    # Verify PyArrow can open it
    try:
        pa_table = pq.read_table(output_file)
        parquet_validation = "PASS"
    except Exception as e:
        parquet_validation = f"FAIL: {e}"

    con = duckdb.connect()

    # Verify columns and schema
    cols = [col[0] for col in con.execute(f"DESCRIBE SELECT * FROM read_parquet('{output_file}')").fetchall()]
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in cols]
    schema_validation = "PASS" if not missing_cols else f"FAIL: Missing {missing_cols}"

    # Query key metrics
    stats = con.execute(f"""
        SELECT
            COUNT(*) AS total_rows,
            COUNT(DISTINCT post_id) AS unique_posts,
            COUNT(DISTINCT author_id_hash) AS unique_authors,
            COUNT(DISTINCT content_hash) AS unique_content_hashes,
            MIN(created_at) AS min_created_at,
            MAX(created_at) AS max_created_at,
            COUNT(*) - COUNT(text) AS null_text,
            COUNT(*) - COUNT(post_id) AS null_post_id,
            COUNT(*) - COUNT(created_at) AS null_created_at,
            COUNT(*) - COUNT(author_id_hash) AS null_author_hash,
            SUM(CASE WHEN like_count < 0 OR repost_count < 0 OR reply_count < 0 OR view_count < 0 THEN 1 ELSE 0 END) AS negative_engagement,
            
            MIN(like_count) AS min_likes,
            MAX(like_count) AS max_likes,
            AVG(like_count) AS avg_likes,
            MEDIAN(like_count) AS med_likes,
            
            MIN(repost_count) AS min_reposts,
            MAX(repost_count) AS max_reposts,
            AVG(repost_count) AS avg_reposts,
            MEDIAN(repost_count) AS med_reposts,
            
            MIN(reply_count) AS min_replies,
            MAX(reply_count) AS max_replies,
            AVG(reply_count) AS avg_replies,
            MEDIAN(reply_count) AS med_replies,
            
            MIN(view_count) AS min_views,
            MAX(view_count) AS max_views,
            AVG(view_count) AS avg_views,
            MEDIAN(view_count) AS med_views
        FROM read_parquet('{output_file}')
    """).fetchone()

    total_rows = stats[0]
    unique_posts = stats[1]
    unique_authors = stats[2]
    unique_content_hashes = stats[3]
    min_created_at = str(stats[4])
    max_created_at = str(stats[5])
    null_text_count = stats[6]
    null_post_id_count = stats[7]
    null_created_at_count = stats[8]
    null_author_hash_count = stats[9]
    negative_engagement_count = stats[10]

    # Language distribution
    lang_rows = con.execute(f"""
        SELECT language, COUNT(*) AS cnt
        FROM read_parquet('{output_file}')
        GROUP BY language
        ORDER BY cnt DESC
    """).fetchall()
    language_distribution = {row[0]: row[1] for row in lang_rows}

    # Engagement stats
    engagement_statistics = {
        "like_count": {
            "min": int(stats[11]),
            "max": int(stats[12]),
            "mean": round(float(stats[13]), 2),
            "median": float(stats[14]),
        },
        "repost_count": {
            "min": int(stats[15]),
            "max": int(stats[16]),
            "mean": round(float(stats[17]), 2),
            "median": float(stats[18]),
        },
        "reply_count": {
            "min": int(stats[19]),
            "max": int(stats[20]),
            "mean": round(float(stats[21]), 2),
            "median": float(stats[22]),
        },
        "view_count": {
            "min": int(stats[23]),
            "max": int(stats[24]),
            "mean": round(float(stats[25]), 2),
            "median": float(stats[26]),
        },
    }

    # Null counts across all required columns
    null_counts = {}
    for c in cols:
        cnt = con.execute(f"SELECT COUNT(*) - COUNT({c}) FROM read_parquet('{output_file}')").fetchone()[0]
        null_counts[c] = cnt

    con.close()

    # Determine validation status
    is_valid = (
        parquet_validation == "PASS"
        and schema_validation == "PASS"
        and total_rows > 0
        and unique_posts == total_rows
        and null_post_id_count == 0
        and null_text_count == 0
        and null_created_at_count == 0
        and negative_engagement_count == 0
    )

    status_str = "SUCCESS" if is_valid else "FAILED"

    report_data = {
        "pipeline": "NEXUS X Cleaning",
        "status": status_str,
        "pipeline_status": status_str,
        "input_records": filter_metrics.get("input_records", 0),
        "output_records": total_rows,
        "removed_null_post_id": filter_metrics.get("removed_null_post_id", 0),
        "removed_null_text": filter_metrics.get("removed_null_text", 0),
        "removed_short_text": filter_metrics.get("removed_short_text", 0),
        "removed_long_text": filter_metrics.get("removed_long_text", 0),
        "removed_invalid_timestamp": filter_metrics.get("removed_invalid_timestamp", 0),
        "removed_duplicate_post_id": filter_metrics.get("removed_duplicate_post_id", 0),
        "excluded_retweets": filter_metrics.get("excluded_retweets", 0),
        "unique_posts": unique_posts,
        "unique_authors": unique_authors,
        "unique_content_hashes": unique_content_hashes,
        "language_distribution": language_distribution,
        "timestamp_min": min_created_at,
        "timestamp_max": max_created_at,
        "null_counts": null_counts,
        "engagement_statistics": engagement_statistics,
        "schema_validation": schema_validation,
        "parquet_validation": parquet_validation,
        "tests": "PASS" if is_valid else "FAIL",
    }

    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)

    return report_data
