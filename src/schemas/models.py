from datetime import datetime
from typing import Any, Optional

from sqlalchemy import BigInteger, DateTime, Index, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from src.schemas.base import Base


class SocialPost(Base):
    """SQLAlchemy 2.0 ORM model representing unified social media posts."""

    __tablename__ = "social_posts"

    # Identity
    post_id: Mapped[str] = mapped_column(Text, primary_key=True)
    platform: Mapped[str] = mapped_column(Text, nullable=False)
    source_type: Mapped[str] = mapped_column(Text, nullable=False)

    # Author
    author_id_hash: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    author_username_hash: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Content
    text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    language: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content_hash: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Time
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ingestion_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=datetime.now,
        nullable=False,
    )

    # Conversation / Relationships
    conversation_id: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reply_to_post_id: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    quoted_post_id: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reposted_post_id: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Entities (JSONB for PostgreSQL, JSON fallback for other dialects)
    hashtags: Mapped[Optional[Any]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"),
        nullable=True,
    )
    mentions: Mapped[Optional[Any]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"),
        nullable=True,
    )
    urls: Mapped[Optional[Any]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"),
        nullable=True,
    )

    # Engagement
    like_count: Mapped[int] = mapped_column(BigInteger, default=0, server_default="0", nullable=False)
    repost_count: Mapped[int] = mapped_column(BigInteger, default=0, server_default="0", nullable=False)
    reply_count: Mapped[int] = mapped_column(BigInteger, default=0, server_default="0", nullable=False)
    view_count: Mapped[int] = mapped_column(BigInteger, default=0, server_default="0", nullable=False)
    quote_count: Mapped[int] = mapped_column(BigInteger, default=0, server_default="0", nullable=False)

    # Media
    media_type: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    media_urls: Mapped[Optional[Any]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"),
        nullable=True,
    )

    # Provenance
    source_dataset: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_record_id: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Processing
    schema_version: Mapped[str] = mapped_column(
        Text,
        default="1.0",
        server_default="'1.0'",
        nullable=False,
    )
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Indexes
    __table_args__ = (
        Index("idx_social_posts_platform_created_at", "platform", "created_at"),
        Index("idx_social_posts_author_hash", "author_id_hash"),
        Index("idx_social_posts_conversation_id", "conversation_id"),
    )

    def __repr__(self) -> str:
        return f"<SocialPost(post_id={self.post_id!r}, platform={self.platform!r}, created_at={self.created_at!r})>"
