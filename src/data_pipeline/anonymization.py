"""
NEXUS Data Pipeline - Author Anonymization Module
Provides deterministic pseudonymous hashing using HMAC-SHA256.
Adheres to privacy standards without exposing raw author identifiers.
"""

import os
import hmac
import hashlib
from typing import Optional

# Secret resolution: Prefer NEXUS_HASH_SECRET, fallback to NEXUS_HMAC_SECRET or development salt
DEFAULT_DEV_SECRET = "nexus_development_salt_2026"
_RAW_SECRET = os.environ.get("NEXUS_HASH_SECRET") or os.environ.get("NEXUS_HMAC_SECRET") or DEFAULT_DEV_SECRET
HASH_SECRET = _RAW_SECRET.encode("utf-8")


def get_hash_secret() -> bytes:
    """Returns the active binary HMAC secret."""
    return HASH_SECRET


def anonymize_id(raw_val: Optional[str], secret: Optional[bytes] = None) -> Optional[str]:
    """
    Deterministically anonymize author platform IDs using HMAC-SHA256.
    
    Args:
        raw_val: The raw author ID (e.g., numeric string).
        secret: Optional binary secret; defaults to HASH_SECRET.
        
    Returns:
        64-character hex digest, or None if input is empty/null.
    """
    if raw_val is None:
        return None
    val_str = str(raw_val).strip()
    if not val_str:
        return None
    key = secret or HASH_SECRET
    return hmac.new(key, val_str.encode("utf-8"), hashlib.sha256).hexdigest()


def anonymize_username(raw_username: Optional[str], secret: Optional[bytes] = None) -> Optional[str]:
    """
    Deterministically anonymize author usernames using HMAC-SHA256.
    Normalizes username by stripping leading '@' and lowercasing for consistency.
    
    Args:
        raw_username: The raw username handle.
        secret: Optional binary secret; defaults to HASH_SECRET.
        
    Returns:
        64-character hex digest, or None if input is empty/null.
    """
    if raw_username is None:
        return None
    uname_str = str(raw_username).strip().lstrip("@").lower()
    if not uname_str:
        return None
    key = secret or HASH_SECRET
    return hmac.new(key, uname_str.encode("utf-8"), hashlib.sha256).hexdigest()
