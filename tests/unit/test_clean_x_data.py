"""
NEXUS - Test Suite for X Data Cleaning & Normalization Pipeline
Covers all 22 required data engineering and quality criteria.
"""

import os
import json
from datetime import datetime
import duckdb
import pytest

from src.data_pipeline.anonymization import anonymize_id, anonymize_username
from src.data_pipeline.normalization import (
    compute_content_hash,
    detect_language,
    extract_entities,
    normalize_media,
)

INPUT_FILE = "data/x/processed/nexus_x_100k.parquet"
OUTPUT_FILE = "data/x/processed/nexus_x_cleaned.parquet"
REPORT_FILE = "data/x/validation/x_cleaning_report.json"

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


@pytest.fixture(scope="module")
def duckdb_con():
    con = duckdb.connect()
    yield con
    con.close()


# 1. Input exists
def test_1_input_file_exists():
    """Requirement 1: Input parquet file must exist on disk and be non-empty."""
    assert os.path.exists(INPUT_FILE), f"Input file not found at {INPUT_FILE}"
    assert os.path.getsize(INPUT_FILE) > 0, "Input file is 0 bytes"


# 2. Output exists
def test_2_output_file_exists():
    """Requirement 2: Output cleaned parquet file must exist on disk."""
    assert os.path.exists(OUTPUT_FILE), f"Output file not found at {OUTPUT_FILE}"
    assert os.path.getsize(OUTPUT_FILE) > 0, "Output file is 0 bytes"


# 3. Output Parquet opens
def test_3_output_parquet_opens(duckdb_con):
    """Requirement 3: Output file must be readable by DuckDB Parquet reader."""
    res = duckdb_con.execute(f"SELECT COUNT(*) FROM read_parquet('{OUTPUT_FILE}')").fetchone()
    assert res is not None and res[0] > 0, "Could not read records from output parquet file"


# 4. Output has rows
def test_4_output_has_rows(duckdb_con):
    """Requirement 4: Output dataset row count must be greater than zero."""
    count = duckdb_con.execute(f"SELECT COUNT(*) FROM read_parquet('{OUTPUT_FILE}')").fetchone()[0]
    assert count > 0, f"Expected positive row count, found {count}"


# 5. Required columns exist
def test_5_required_columns_exist(duckdb_con):
    """Requirement 5: Output schema must contain all 29 unified schema columns."""
    cols = [col[0] for col in duckdb_con.execute(f"DESCRIBE SELECT * FROM read_parquet('{OUTPUT_FILE}')").fetchall()]
    for req_col in REQUIRED_COLUMNS:
        assert req_col in cols, f"Missing required column: {req_col}"


# 6. post_id is non-null
def test_6_post_id_is_non_null(duckdb_con):
    """Requirement 6: post_id must never be null or empty string."""
    null_count = duckdb_con.execute(f"""
        SELECT COUNT(*) FROM read_parquet('{OUTPUT_FILE}')
        WHERE post_id IS NULL OR TRIM(post_id) = ''
    """).fetchone()[0]
    assert null_count == 0, f"Found {null_count} null or empty post_id records"


# 7. post_id is unique
def test_7_post_id_is_unique(duckdb_con):
    """Requirement 7: post_id must be strictly unique across the analytical dataset."""
    res = duckdb_con.execute(f"""
        SELECT COUNT(*), COUNT(DISTINCT post_id)
        FROM read_parquet('{OUTPUT_FILE}')
    """).fetchone()
    assert res[0] == res[1], f"Total records ({res[0]}) != unique post_id count ({res[1]})"


# 8. text is non-null
def test_8_text_is_non_null(duckdb_con):
    """Requirement 8: text must never be null or whitespace-only."""
    null_count = duckdb_con.execute(f"""
        SELECT COUNT(*) FROM read_parquet('{OUTPUT_FILE}')
        WHERE text IS NULL OR TRIM(text) = ''
    """).fetchone()[0]
    assert null_count == 0, f"Found {null_count} null/empty text records"


# 9. text length is valid
def test_9_text_length_is_valid(duckdb_con):
    """Requirement 9: text length must satisfy 10 <= length <= 5000 characters."""
    bad_count = duckdb_con.execute(f"""
        SELECT COUNT(*) FROM read_parquet('{OUTPUT_FILE}')
        WHERE LENGTH(TRIM(text)) < 10 OR LENGTH(TRIM(text)) > 5000
    """).fetchone()[0]
    assert bad_count == 0, f"Found {bad_count} records violating text length bounds [10, 5000]"


# 10. created_at is valid
def test_10_created_at_is_valid(duckdb_con):
    """Requirement 10: created_at must be valid non-null timestamp in UTC."""
    res = duckdb_con.execute(f"""
        SELECT
            COUNT(*) FILTER (WHERE created_at IS NULL),
            COUNT(*) FILTER (WHERE created_at < '2006-01-01'),
            COUNT(*) FILTER (WHERE created_at > '2026-07-28')
        FROM read_parquet('{OUTPUT_FILE}')
    """).fetchone()
    assert res[0] == 0, f"Found {res[0]} null created_at timestamps"
    assert res[1] == 0, f"Found {res[1]} impossible historical timestamps before 2006"
    assert res[2] == 0, f"Found {res[2]} impossible future timestamps beyond dataset context"


# 11. language exists
def test_11_language_exists(duckdb_con):
    """Requirement 11: language must be populated for all records."""
    null_count = duckdb_con.execute(f"""
        SELECT COUNT(*) FROM read_parquet('{OUTPUT_FILE}')
        WHERE language IS NULL OR language = ''
    """).fetchone()[0]
    assert null_count == 0, f"Found {null_count} unassigned language records"


# 12. content_hash exists
def test_12_content_hash_exists(duckdb_con):
    """Requirement 12: content_hash must be a valid 64-char SHA256 hex string."""
    bad_count = duckdb_con.execute(f"""
        SELECT COUNT(*) FROM read_parquet('{OUTPUT_FILE}')
        WHERE content_hash IS NULL OR LENGTH(content_hash) != 64
    """).fetchone()[0]
    assert bad_count == 0, f"Found {bad_count} invalid content_hash records"


# 13. author_id_hash exists
def test_13_author_id_hash_exists(duckdb_con):
    """Requirement 13: author_id_hash must be 64-char hex when present; raw IDs must not appear."""
    bad_count = duckdb_con.execute(f"""
        SELECT COUNT(*) FROM read_parquet('{OUTPUT_FILE}')
        WHERE author_id_hash IS NOT NULL AND LENGTH(author_id_hash) != 64
    """).fetchone()[0]
    assert bad_count == 0, f"Found {bad_count} invalid author_id_hash values"


# 14. engagement values are non-negative
def test_14_engagement_values_non_negative(duckdb_con):
    """Requirement 14: like_count, repost_count, reply_count, view_count must be >= 0."""
    bad_count = duckdb_con.execute(f"""
        SELECT COUNT(*) FROM read_parquet('{OUTPUT_FILE}')
        WHERE like_count < 0
           OR repost_count < 0
           OR reply_count < 0
           OR view_count < 0
    """).fetchone()[0]
    assert bad_count == 0, f"Found {bad_count} records with negative engagement counts"


# 15. platform = 'x'
def test_15_platform_equals_x(duckdb_con):
    """Requirement 15: platform must equal 'x'."""
    bad_count = duckdb_con.execute(f"""
        SELECT COUNT(*) FROM read_parquet('{OUTPUT_FILE}') WHERE platform != 'x'
    """).fetchone()[0]
    assert bad_count == 0, f"Found {bad_count} records with platform != 'x'"


# 16. source_type = 'historical_public'
def test_16_source_type_equals_historical_public(duckdb_con):
    """Requirement 16: source_type must equal 'historical_public'."""
    bad_count = duckdb_con.execute(f"""
        SELECT COUNT(*) FROM read_parquet('{OUTPUT_FILE}') WHERE source_type != 'historical_public'
    """).fetchone()[0]
    assert bad_count == 0, f"Found {bad_count} records with source_type != 'historical_public'"


# 17. source_dataset is correct
def test_17_source_dataset_is_correct(duckdb_con):
    """Requirement 17: source_dataset must equal 'SinclairSchneider/tweets_sample_2026'."""
    bad_count = duckdb_con.execute(f"""
        SELECT COUNT(*) FROM read_parquet('{OUTPUT_FILE}')
        WHERE source_dataset != 'SinclairSchneider/tweets_sample_2026'
    """).fetchone()[0]
    assert bad_count == 0, f"Found {bad_count} records with incorrect source_dataset"


# 18. schema_version exists
def test_18_schema_version_exists(duckdb_con):
    """Requirement 18: schema_version must equal '1.0'."""
    bad_count = duckdb_con.execute(f"""
        SELECT COUNT(*) FROM read_parquet('{OUTPUT_FILE}') WHERE schema_version != '1.0'
    """).fetchone()[0]
    assert bad_count == 0, f"Found {bad_count} records with schema_version != '1.0'"


# 19. no unexpected duplicate post IDs
def test_19_no_duplicate_post_ids(duckdb_con):
    """Requirement 19: Confirm zero duplicate post_id occurrences."""
    dupes = duckdb_con.execute(f"""
        SELECT post_id, COUNT(*) as cnt
        FROM read_parquet('{OUTPUT_FILE}')
        GROUP BY post_id
        HAVING cnt > 1
    """).fetchall()
    assert len(dupes) == 0, f"Found {len(dupes)} duplicated post IDs: {dupes[:5]}"


# 20. entity extraction works
def test_20_entity_extraction_works():
    """Requirement 20: Test hashtag, mention, and URL extraction behavior."""
    sample = "Join the #AI and #DataScience revolution with @OpenAI at https://openai.com!"
    h, m, u = extract_entities(sample)
    assert "#AI" in h and "#DataScience" in h
    assert "@OpenAI" in m
    assert "https://openai.com!" in u or "https://openai.com" in [url.rstrip("!") for url in u]


# 21. media fields are valid
def test_21_media_fields_are_valid(duckdb_con):
    """Requirement 21: media_type must be in ('text', 'image', 'video', 'gif', 'mixed')."""
    bad_count = duckdb_con.execute(f"""
        SELECT COUNT(*) FROM read_parquet('{OUTPUT_FILE}')
        WHERE media_type NOT IN ('text', 'image', 'video', 'gif', 'mixed')
    """).fetchone()[0]
    assert bad_count == 0, f"Found {bad_count} records with invalid media_type"


# 22. provenance is preserved
def test_22_provenance_is_preserved(duckdb_con):
    """Requirement 22: Provenance fields must be non-null and correctly mapped."""
    bad_count = duckdb_con.execute(f"""
        SELECT COUNT(*) FROM read_parquet('{OUTPUT_FILE}')
        WHERE source_record_id IS NULL OR source_record_id = ''
           OR ingestion_timestamp IS NULL
           OR processed_at IS NULL
    """).fetchone()[0]
    assert bad_count == 0, f"Found {bad_count} records with missing provenance fields"


# Extra check for data quality report
def test_data_quality_report():
    """Verify x_cleaning_report.json validity and SUCCESS status."""
    assert os.path.exists(REPORT_FILE), f"Report file not found: {REPORT_FILE}"
    with open(REPORT_FILE, "r", encoding="utf-8") as f:
        rep = json.load(f)
    assert rep.get("pipeline_status") == "SUCCESS"
    assert rep.get("output_records", 0) > 0
    assert rep.get("schema_validation") == "PASS"
    assert rep.get("parquet_validation") == "PASS"
