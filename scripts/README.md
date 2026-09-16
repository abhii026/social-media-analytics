# NEXUS — Pipeline Scripts

This folder contains executable CLI scripts for the NEXUS Social Media Analytics data pipeline.

---

## Quick Start (Run All Stages)

To run the complete data pipeline (inspection → cleaning → validation) in a single command:

```bash
python scripts/run_x_pipeline.py
```

---

## Pipeline Execution Workflow

The scripts are organized in sequential order according to data flow:

```
[HuggingFace / Source Data]
           │
           ▼ (Stage 0)
    extract_x_100k.py          ──► Saves data/x/processed/nexus_x_100k.parquet
           │
           ▼ (Stage 1)
   inspect_x_schema.py         ──► Inspects source schema, columns, and distributions
           │
           ▼ (Stage 2)
     clean_x_data.py           ──► Cleans, normalizes, anonymizes, deduplicates
           │                       ──► Outputs data/x/processed/nexus_x_cleaned.parquet
           ▼ (Stage 3)
    validate_x_data.py         ──► Validates 22 quality criteria
                                   ──► Outputs data/x/validation/x_cleaning_report.json
```

---

## Individual Script Details

### 1. `run_x_pipeline.py` (Master Runner)
- **Purpose**: Executes the end-to-end pipeline in one go.
- **Stages**:
  1. Calls `inspect_schema()` from `inspect_x_schema.py`.
  2. Calls `run_pipeline()` from `src.data_pipeline.cleaning`.
  3. Calls `run_validation()` from `validate_x_data.py`.
- **Usage**:
  ```bash
  python scripts/run_x_pipeline.py
  ```

### 2. `extract_x_100k.py` (Sample Extraction)
- **Purpose**: Downloads and samples 100,000 records from the `SinclairSchneider/tweets_sample_2026` dataset on HuggingFace using DuckDB HTTP streaming.
- **Output**: `data/x/processed/nexus_x_100k.parquet`
- **Usage**:
  ```bash
  python scripts/extract_x_100k.py
  ```

### 3. `inspect_x_schema.py` (Schema & Summary Inspection)
- **Purpose**: Inspects column types, row counts, null values, and summary statistics of the raw sample Parquet file.
- **Usage**:
  ```bash
  python scripts/inspect_x_schema.py
  ```

### 4. `clean_x_data.py` (ETL & Normalization Entry Point)
- **Purpose**: CLI entry point to trigger the data cleaning engine in `src/data_pipeline/cleaning.py`.
- **Actions**:
  - Text cleaning and NFKC normalization
  - Content hashing (SHA-256)
  - Entity extraction (hashtags, mentions, URLs)
  - Media type normalization
  - Parallel language detection via `langdetect`
  - Author pseudonymization via HMAC-SHA256 (`NEXUS_HASH_SECRET`)
  - Timestamp UTC ISO-8601 formatting
- **Output**: `data/x/processed/nexus_x_cleaned.parquet`
- **Usage**:
  ```bash
  python scripts/clean_x_data.py
  ```

### 5. `validate_x_data.py` (Quality & Schema Verification)
- **Purpose**: Evaluates the cleaned dataset against 22 data engineering quality criteria.
- **Verifications**:
  - Parquet readability and schema completeness (all 29 required columns)
  - ID uniqueness and non-null guarantees
  - Valid UTC timestamps and engagement metrics
  - Multi-language distribution
  - Anonymization and content hash validity
- **Output**: `data/x/validation/x_cleaning_report.json`
- **Usage**:
  ```bash
  python scripts/validate_x_data.py
  ```
