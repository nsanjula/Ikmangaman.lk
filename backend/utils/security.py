import secrets
import hashlib
from datetime import datetime, timedelta, timezone

def now_utc():
    """Return the current UTC time (timezone-aware)."""
    return datetime.now(timezone.utc)

def new_reset_token(ttl_minutes: int = 30):
    """
    Generate a secure raw token, its SHA256 hash, and expiry datetime.
    - raw_token: sent to user via email
    - token_hash: stored in DB
    - expires_at: stored in DB
    """
    raw_token = secrets.token_urlsafe(48)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    expires_at = now_utc() + timedelta(minutes=ttl_minutes)
    return raw_token, token_hash, expires_at

def hash_token(raw_token: str) -> str:
    """Return the SHA256 hash of a raw token (for verification)."""
    return hashlib.sha256(raw_token.encode()).hexdigest()

def verify_token(raw_token: str, token_hash: str) -> bool:
    """Check whether a raw token matches its stored hash."""
    return hash_token(raw_token) == token_hash
