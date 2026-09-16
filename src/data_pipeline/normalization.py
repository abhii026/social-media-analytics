"""
NEXUS Data Pipeline - Normalization & Entity Extraction Module
Handles content hashing, entity extraction (hashtags, mentions, URLs),
media normalization, and language detection.
"""

import re
import hashlib
from typing import Any, List, Optional, Tuple
import langdetect

# Regex patterns for social media entity extraction (Unicode-aware)
HASHTAG_REGEX = re.compile(r"#\w+", re.UNICODE)
MENTION_REGEX = re.compile(r"@\w+", re.UNICODE)
URL_REGEX = re.compile(r"https?://\S+", re.UNICODE)


def init_detector():
    """Ensure deterministic random seed across worker processes."""
    langdetect.DetectorFactory.seed = 0


# Initialize in main process
init_detector()


def compute_content_hash(text: str) -> str:
    """
    Compute SHA-256 hash on normalized text (trimmed, collapsed whitespace, lowercased).
    Used for duplicate analysis, coordination detection, and propagation tracking.
    """
    if not text:
        return hashlib.sha256(b"").hexdigest()
    normalized = re.sub(r"\s+", " ", str(text).strip().lower())
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def extract_entities(text: Optional[str]) -> Tuple[List[str], List[str], List[str]]:
    """
    Extract hashtags, mentions, and URLs from post text without modifying original content.
    Returns:
        (hashtags, mentions, urls)
    """
    if not text:
        return [], [], []
    text_str = str(text)
    hashtags = HASHTAG_REGEX.findall(text_str)
    mentions = MENTION_REGEX.findall(text_str)
    urls = URL_REGEX.findall(text_str)
    return hashtags, mentions, urls


def detect_language(text: Optional[str]) -> Tuple[str, float]:
    """
    Detect language and confidence using langdetect.
    Returns:
        (language_code, confidence)
    """
    if not text:
        return "unknown", 0.0
    text_str = str(text).strip()
    if len(text_str) < 3:
        return "unknown", 0.0
    try:
        langs = langdetect.detect_langs(text_str)
        if langs:
            return str(langs[0].lang), round(float(langs[0].prob), 4)
    except Exception:
        pass
    return "unknown", 0.0


def detect_language_batch(texts: List[str]) -> List[Tuple[str, float]]:
    """Batch worker function for multiprocessing language detection."""
    results = []
    for t in texts:
        results.append(detect_language(t))
    return results


def normalize_media(
    pictures: Optional[Any],
    videos: Optional[Any],
    gifs: Optional[Any],
) -> Tuple[str, List[str]]:
    """
    Normalize media arrays into media_type and media_urls.
    Types: 'text', 'image', 'video', 'gif', 'mixed'.
    Safely handles nested Parquet list/struct types.
    """
    has_pictures = bool(pictures and len(pictures) > 0)
    has_videos = bool(videos and len(videos) > 0)
    has_gifs = bool(gifs and len(gifs) > 0)

    urls: List[str] = []

    # Collect pictures (expected to be string URLs)
    if has_pictures and isinstance(pictures, (list, tuple)):
        for pic in pictures:
            if pic and isinstance(pic, str) and pic.strip().startswith("http"):
                urls.append(pic.strip())

    # Collect gifs (expected to be string URLs)
    if has_gifs and isinstance(gifs, (list, tuple)):
        for gif in gifs:
            if gif and isinstance(gif, str) and gif.strip().startswith("http"):
                urls.append(gif.strip())

    # Check videos (in source data, can be integer durations or strings)
    if has_videos and isinstance(videos, (list, tuple)):
        for vid in videos:
            if vid and isinstance(vid, str) and vid.strip().startswith("http"):
                urls.append(vid.strip())

    active_count = sum([1 for flag in (has_pictures, has_videos, has_gifs) if flag])

    if active_count > 1:
        media_type = "mixed"
    elif has_pictures:
        media_type = "image"
    elif has_videos:
        media_type = "video"
    elif has_gifs:
        media_type = "gif"
    else:
        media_type = "text"

    return media_type, urls
