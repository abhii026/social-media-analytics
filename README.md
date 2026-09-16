# NEXUS — AI-Driven Social Media Analytics Framework

NEXUS is a modular, high-performance social media data engineering and analytics framework designed to extract, clean, normalize, anonymize, validate, and analyze cross-platform social media posts into a production-grade unified schema.

---

## Repository Structure & Architecture

```
social-media-analytics/
├── .gitignore                     # Git rules ignoring caches, virtualenvs, browser profiles
├── pytest.ini                     # Pytest configuration (test discovery & pythonpath)
├── requirements.txt               # Locked project dependencies (DuckDB, PyArrow, Pydantic, etc.)
├── README.md                      # Framework documentation & architecture guide
│
├── data/                          # Pipeline storage for datasets & audit reports
│   ├── processed/                 # General processed outputs (.gitkeep)
│   ├── raw/                       # General raw data dumps (.gitkeep)
│   └── x/                         # X (Twitter) pipeline datasets
│       ├── processed/             # Parquet datasets (nexus_x_100k, nexus_x_cleaned)
│       └── validation/            # Verification reports (x_cleaning_report.json)
│
├── scripts/                       # Executable CLI workflows & pipeline runners
│   ├── README.md                  # Workflow execution guide & script details
│   ├── run_x_pipeline.py          # Master runner: inspect -> clean -> validate in sequence
│   ├── extract_x_100k.py          # Stage 0: Sample extraction from HuggingFace
│   ├── inspect_x_schema.py        # Stage 1: Inspect source schema and distributions
│   ├── clean_x_data.py            # Stage 2: Data cleaning, normalization & anonymization
│   └── validate_x_data.py         # Stage 3: 22-criteria quality validation & reporting
│
├── src/                           # Core reusable application packages
│   ├── __init__.py                # Package root
│   │
│   ├── data_pipeline/             # Data processing, cleaning, and quality engine
│   │   ├── __init__.py            # Clean exports of data pipeline functions
│   │   ├── anonymization.py       # Deterministic HMAC-SHA256 author pseudonymization
│   │   ├── cleaning.py            # DuckDB SQL-based cleaning, deduplication & UTC conversion
│   │   ├── normalization.py       # NFKC text normalization, entity extraction & media typing
│   │   └── validation.py          # Quality criteria evaluation & JSON report builder
│   │
│   └── schemas/                   # Unified schema models and database contracts
│       ├── __init__.py            # Clean exports for schemas and ORM models
│       ├── base.py                # SQLAlchemy 2.0 DeclarativeBase
│       ├── models.py              # SQLAlchemy 2.0 ORM model (SocialPost)
│       ├── pydantic_models.py     # Pydantic v2 validation models (Create/Read/Base)
│       └── social_posts.sql       # PostgreSQL / TimescaleDB / DuckDB DDL schema
│
└── tests/                         # Automated test suite
    ├── __init__.py                # Test package root
    └── unit/                      # Unit tests
        ├── __init__.py            # Unit test package marker
        ├── test_clean_x_data.py   # 23 tests verifying the 22 data quality criteria
        └── test_schemas.py        # 3 tests verifying Pydantic models & SQLAlchemy ORM
```

---

## Key Modules Breakdown

### 1. Data Pipeline (`src/data_pipeline/`)
- **`anonymization.py`**: Ensures compliance and privacy via HMAC-SHA256 pseudonymization of author identifiers using `NEXUS_HASH_SECRET`.
- **`normalization.py`**: Performs unicode NFKC text normalization, SHA-256 content hashing, regex-based entity extraction (`#hashtags`, `@mentions`, `urls`), media type classification (`none`, `image`, `video`, `mixed`), and parallel language detection via `langdetect`.
- **`cleaning.py`**: Uses DuckDB for in-memory, zero-copy SQL deduplication on `post_id`, non-null verification, and UTC timestamp formatting.
- **`validation.py`**: Automated evaluator that scores data quality against 22 distinct criteria and produces `x_cleaning_report.json`.

### 2. Unified Schema (`src/schemas/`)
- **`models.py`**: SQLAlchemy 2.0 declarative ORM model mapping `social_posts` with PostgreSQL/TimescaleDB JSONB support and indexes.
- **`pydantic_models.py`**: Pydantic v2 schemas (`SocialPostCreate`, `SocialPostRead`, `SocialPostBase`) enforcing type safety and defaults.
- **`social_posts.sql`**: Production DDL schema with composite indexes on `(platform, created_at DESC)` and `author_id_hash`.

### 3. Pipeline Scripts (`scripts/`)
Contains modular CLI commands with `run_x_pipeline.py` acting as the master orchestrator. See [scripts/README.md](file:///c:/Users/bansa/Desktop/social-media-analytics/scripts/README.md) for full execution options.

---

## Quick Start Guide

### 1. Environment Setup

```bash
# Create and activate virtual environment (optional)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Execute End-to-End Pipeline

Run the entire pipeline (inspect schema, clean & anonymize 100,000 posts, validate output):

```bash
python scripts/run_x_pipeline.py
```

### 3. Run Automated Tests

Execute all 26 test cases covering data engineering quality and schema contracts:

```bash
pytest
```

---

## Outputs & Artifacts

- **Cleaned Parquet Dataset**: `data/x/processed/nexus_x_cleaned.parquet` (100,000 unified, cleaned posts)
- **Data Quality Report**: `data/x/validation/x_cleaning_report.json`
