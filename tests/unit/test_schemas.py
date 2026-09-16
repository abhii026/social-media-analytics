from datetime import datetime, timezone
import pytest
from pydantic import ValidationError
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from src.schemas import (
    Base,
    SocialPost,
    SocialPostCreate,
    SocialPostRead,
)


def test_pydantic_social_post_create_valid():
    """Test successful creation and defaults of SocialPostCreate."""
    now = datetime.now(timezone.utc)
    post = SocialPostCreate(
        post_id="post_12345",
        platform="x",
        source_type="reference_2026",
        created_at=now,
        text="Hello world #testing @user",
        hashtags=["#testing"],
        mentions=["@user"],
    )

    assert post.post_id == "post_12345"
    assert post.platform == "x"
    assert post.like_count == 0
    assert post.repost_count == 0
    assert post.reply_count == 0
    assert post.view_count == 0
    assert post.quote_count == 0
    assert post.schema_version == "1.0"
    assert post.hashtags == ["#testing"]
    assert post.mentions == ["@user"]


def test_pydantic_social_post_missing_required():
    """Test validation errors when required fields are missing."""
    with pytest.raises(ValidationError):
        # Missing platform, source_type, and created_at
        SocialPostCreate(post_id="post_fail")


def test_sqlalchemy_model_sqlite_integration():
    """Test creating SQLite in-memory tables and querying SocialPost."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    now = datetime.now(timezone.utc)
    with Session(engine) as session:
        post = SocialPost(
            post_id="x_9999",
            platform="x",
            source_type="reference_2026",
            created_at=now,
            text="SQLAlchemy 2.0 works smoothly!",
            author_id_hash="abc_hash",
            hashtags=["sql", "python"],
            like_count=42,
        )
        session.add(post)
        session.commit()

        # Query back
        stmt = select(SocialPost).where(SocialPost.post_id == "x_9999")
        db_post = session.scalar(stmt)

        assert db_post is not None
        assert db_post.post_id == "x_9999"
        assert db_post.like_count == 42
        assert db_post.hashtags == ["sql", "python"]

        # Validate with Pydantic from ORM attribute mode
        read_dto = SocialPostRead.model_validate(db_post)
        assert read_dto.post_id == db_post.post_id
        assert read_dto.like_count == 42
        assert read_dto.hashtags == ["sql", "python"]
