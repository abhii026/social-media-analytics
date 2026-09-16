from datetime import datetime, timezone
from typing import Any, List, Optional, Union

from pydantic import BaseModel, ConfigDict, Field


class SocialPostBase(BaseModel):
    """Base schema with core shared attributes for a social media post."""

    post_id: str = Field(..., description="Unique post identifier across platforms")
    platform: str = Field(..., description="Platform name, e.g., 'x', 'bluesky', 'reddit'")
    source_type: str = Field(..., description="Source nature, e.g., 'reference_2026', 'api', 'stream'")

    # Author
    author_id_hash: Optional[str] = Field(default=None, description="SHA-256 or anonymized author ID")
    author_username_hash: Optional[str] = Field(default=None, description="Anonymized username hash")

    # Content
    text: Optional[str] = Field(default=None, description="Post text body")
    language: Optional[str] = Field(default=None, description="ISO language code, e.g., 'en'")
    content_hash: Optional[str] = Field(default=None, description="Hash of normalized text for deduplication")

    # Time
    created_at: datetime = Field(..., description="Timestamp when post was created on platform")
    ingestion_timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp when record was ingested",
    )

    # Conversation / Relationships
    conversation_id: Optional[str] = Field(default=None, description="Thread / conversation ID")
    reply_to_post_id: Optional[str] = Field(default=None, description="Parent post ID if reply")
    quoted_post_id: Optional[str] = Field(default=None, description="Quoted post ID")
    reposted_post_id: Optional[str] = Field(default=None, description="Original post ID if repost")

    # Entities
    hashtags: Optional[Union[List[str], List[Any], dict]] = Field(
        default_factory=list,
        description="Extracted hashtags list or metadata",
    )
    mentions: Optional[Union[List[str], List[Any], dict]] = Field(
        default_factory=list,
        description="Mentioned user handles / IDs",
    )
    urls: Optional[Union[List[str], List[Any], dict]] = Field(
        default_factory=list,
        description="Extracted URLs",
    )

    # Engagement
    like_count: int = Field(default=0, ge=0, description="Number of likes")
    repost_count: int = Field(default=0, ge=0, description="Number of reposts/retweets")
    reply_count: int = Field(default=0, ge=0, description="Number of replies")
    view_count: int = Field(default=0, ge=0, description="Number of views/impressions")
    quote_count: int = Field(default=0, ge=0, description="Number of quote posts")

    # Media
    media_type: Optional[str] = Field(default=None, description="e.g., 'photo', 'video', 'animated_gif'")
    media_urls: Optional[Union[List[str], List[Any], dict]] = Field(
        default_factory=list,
        description="URLs to attached media",
    )

    # Provenance
    source_dataset: Optional[str] = Field(default=None, description="Originating dataset identifier")
    source_record_id: Optional[str] = Field(default=None, description="Original record ID in source dataset")

    # Processing
    schema_version: str = Field(default="1.0", description="Schema specification version")
    processed_at: Optional[datetime] = Field(default=None, description="Enrichment/NLP processing timestamp")


class SocialPostCreate(SocialPostBase):
    """Schema for validating and inserting a new post into the database."""
    pass


class SocialPostRead(SocialPostBase):
    """Schema for reading/serializing a post from database models or API responses."""

    model_config = ConfigDict(from_attributes=True)
