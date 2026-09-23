"""Password hashing and brute-force protection for HA Share."""
from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import timedelta

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import (
    CONF_LOCKOUT_MINUTES,
    CONF_MAX_PASSWORD_RETRIES,
    ERR_LOCKED,
    ERR_PASSWORD_INVALID,
    ERR_PASSWORD_REQUIRED,
    EVENT_PASSWORD_FAIL,
    EVENT_PASSWORD_OK,
    FIELD_FAILED_ATTEMPTS,
    FIELD_LOCKED_UNTIL,
    FIELD_PASSWORD_HASH,
    HEADER_SHARE_KEY,
    LOGGER,
)

PBKDF2_ITERATIONS = 200_000
_PASSWORD_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz"


def hash_password(password: str) -> str:
    """Hash a password with PBKDF2-SHA256. Output: pbkdf2_sha256$iters$salt$hash."""
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS
    )
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    """Constant-time verification of a password against a stored hash."""
    try:
        algo, iters, salt_hex, hash_hex = stored.split("$")
        if algo != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), bytes.fromhex(salt_hex), int(iters)
        )
        return hmac.compare_digest(digest.hex(), hash_hex)
    except (ValueError, TypeError):
        return False


def generate_random_password(length: int = 8) -> str:
    """Generate a human-friendly random password."""
    return "".join(secrets.choice(_PASSWORD_ALPHABET) for _ in range(length))


def get_submitted_password(request) -> str:
    """Extract the visitor password from the request header (may be empty)."""
    return request.headers.get(HEADER_SHARE_KEY, "")


async def _verify(hass: HomeAssistant, password: str, stored: str) -> bool:
    """Run PBKDF2 verification in the executor (CPU bound, ~100ms)."""
    return await hass.async_add_executor_job(verify_password, password, stored)


async def check_request_password(
    hass: HomeAssistant, share: dict, request
) -> tuple[bool, str]:
    """Stateless password check for /state and /call (no attempt counting).

    The caller must have passed the share gate beforehand. Returns
    (ok, error_code).
    """
    stored = share.get(FIELD_PASSWORD_HASH)
    if not stored:
        return True, ""
    password = get_submitted_password(request)
    if not password:
        return False, ERR_PASSWORD_REQUIRED
    if not await _verify(hass, password, stored):
        return False, ERR_PASSWORD_INVALID
    return True, ""


async def verify_with_attempt_tracking(
    hass: HomeAssistant, storage, share: dict, password: str, ip: str = ""
) -> tuple[bool, str, dict]:
    """Password verification for the /verify endpoint with brute-force bookkeeping.

    Returns (ok, error_code, info) where info may contain attempts_left /
    locked_until. Gate (including lockout) must be checked before calling.
    """
    stored = share.get(FIELD_PASSWORD_HASH)
    if not stored:
        # No password configured: verification always succeeds.
        return True, "", {}

    if not password:
        # Empty submission never counts as a failed attempt.
        return False, ERR_PASSWORD_REQUIRED, {}

    if await _verify(hass, password, stored):
        share[FIELD_FAILED_ATTEMPTS] = 0
        share[FIELD_LOCKED_UNTIL] = None
        await storage.async_save_shares()
        await storage.async_log(EVENT_PASSWORD_OK, ip=ip, share=share)
        return True, "", {}

    share[FIELD_FAILED_ATTEMPTS] = share.get(FIELD_FAILED_ATTEMPTS, 0) + 1
    info: dict = {}
    max_retries = storage.settings.get(CONF_MAX_PASSWORD_RETRIES, 5)
    lockout_minutes = storage.settings.get(CONF_LOCKOUT_MINUTES, 10)

    if share[FIELD_FAILED_ATTEMPTS] >= max_retries:
        locked_until = dt_util.utcnow() + timedelta(minutes=lockout_minutes)
        share[FIELD_LOCKED_UNTIL] = locked_until.isoformat()
        share[FIELD_FAILED_ATTEMPTS] = 0
        info["locked_until"] = locked_until.isoformat()
        info["locked"] = True
        await storage.async_save_shares()
        await storage.async_log(
            EVENT_PASSWORD_FAIL,
            ip=ip,
            share=share,
            detail=f"locked for {lockout_minutes} min after {max_retries} failures",
        )
        return False, ERR_LOCKED, info

    await storage.async_save_shares()
    await storage.async_log(
        EVENT_PASSWORD_FAIL,
        ip=ip,
        share=share,
        detail=f"attempt {share[FIELD_FAILED_ATTEMPTS]}/{max_retries}",
    )
    info["attempts_left"] = max_retries - share[FIELD_FAILED_ATTEMPTS]
    return False, ERR_PASSWORD_INVALID, info
