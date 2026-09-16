-- ============================================================
-- Social Media Analytics - Unified Social Posts Schema
-- Target: PostgreSQL / TimescaleDB / DuckDB
-- ============================================================

CREATE TABLE IF NOT EXISTS social_posts (
    -- Identity
    post_id              TEXT PRIMARY KEY,
    platform             TEXT NOT NULL,
    source_type          TEXT NOT NULL,

    -- Author
    author_id_hash       TEXT,
    author_username_hash TEXT,

    -- Content
    text                 TEXT,
    language             TEXT,
    content_hash         TEXT,

    -- Time
    created_at            TIMESTAMPTZ NOT NULL,
    ingestion_timestamp   TIMESTAMPTZ DEFAULT NOW(),

    -- Conversation / relationships
    conversation_id       TEXT,
    reply_to_post_id      TEXT,
    quoted_post_id        TEXT,
    reposted_post_id      TEXT,

    -- Entities
    hashtags             JSONB,
    mentions             JSONB,
    urls                 JSONB,

    -- Engagement
    like_count            BIGINT DEFAULT 0,
    repost_count          BIGINT DEFAULT 0,
    reply_count           BIGINT DEFAULT 0,
    view_count            BIGINT DEFAULT 0,
    quote_count           BIGINT DEFAULT 0,

    -- Media
    media_type            TEXT,
    media_urls            JSONB,

    -- Provenance
    source_dataset        TEXT,
    source_record_id      TEXT,

    -- Processing
    schema_version        TEXT DEFAULT '1.0',
    processed_at          TIMESTAMPTZ
);

-- Recommended Indexes for Analytics & Query Performance
CREATE INDEX IF NOT EXISTS idx_social_posts_platform_created_at 
    ON social_posts (platform, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_social_posts_author_hash 
    ON social_posts (author_id_hash);

CREATE INDEX IF NOT EXISTS idx_social_posts_conversation_id 
    ON social_posts (conversation_id) 
    WHERE conversation_id IS NOT NULL;
