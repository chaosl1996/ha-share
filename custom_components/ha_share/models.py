"""Data models and normalization helpers for HA Share."""
from __future__ import annotations

import re
from typing import Any
import uuid

from homeassistant.core import valid_entity_id
from homeassistant.util import dt as dt_util

from .const import (
    DEFAULT_SETTINGS,
    DEFAULT_UI,
    DOMAIN_ICONS,
    CONF_BASE_URL,
    CONF_LOCKOUT_MINUTES,
    CONF_LOG_RETENTION_DAYS,
    CONF_MAX_PASSWORD_RETRIES,
    CONF_POLL_INTERVAL,
    ENTITY_FIELD_ENTITY_ID,
    ENTITY_FIELD_ICON,
    ENTITY_FIELD_LIMIT,
    ENTITY_FIELD_MODE,
    ENTITY_FIELD_NAME,
    ENTITY_FIELD_REMAINING,
    ENTITY_FIELD_SHOW_ATTRS,
    FIELD_CREATED_AT,
    FIELD_DESCRIPTION,
    FIELD_ENABLED,
    FIELD_END_TIME,
    FIELD_ENTITIES,
    FIELD_FAILED_ATTEMPTS,
    FIELD_ID,
    FIELD_LOCKED_UNTIL,
    FIELD_NAME,
    FIELD_PASSWORD_HASH,
    FIELD_POLL_INTERVAL,
    FIELD_START_TIME,
    FIELD_UI,
    MAX_POLL_INTERVAL,
    MIN_POLL_INTERVAL,
    MODE_CONTROL,
    MODE_READ,
    UI_ACCENT,
    UI_CARD_BG,
    UI_FOOTER,
    UI_TEXT_COLOR,
    UI_THEME,
    UI_TITLE,
)

SHARE_ID_RE = re.compile(r"^[0-9a-f]{32}$")

_MODES = (MODE_READ, MODE_CONTROL)
_THEMES = ("light", "dark")


def _clamp_int(value: Any, default: int, lo: int, hi: int) -> int:
    try:
        num = int(value)
    except (TypeError, ValueError):
        return default
    return max(lo, min(hi, num))


def _normalize_time(value: Any) -> str | None:
    """Normalize a timestamp to ISO-8601 UTC. Naive values are treated as local time."""
    if value is None or value == "":
        return None
    parsed = dt_util.parse_datetime(str(value))
    if parsed is None:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=dt_util.DEFAULT_TIME_ZONE)
    return parsed.astimezone(dt_util.UTC).isoformat()


def normalize_settings(data: dict | None) -> dict:
    """Fill defaults and clamp values of the global settings object."""
    data = data or {}
    base_url = str(data.get(CONF_BASE_URL) or "").strip().rstrip("/")
    return {
        CONF_BASE_URL: base_url,
        CONF_POLL_INTERVAL: _clamp_int(
            data.get(CONF_POLL_INTERVAL), DEFAULT_SETTINGS[CONF_POLL_INTERVAL],
            MIN_POLL_INTERVAL, MAX_POLL_INTERVAL,
        ),
        CONF_LOG_RETENTION_DAYS: _clamp_int(
            data.get(CONF_LOG_RETENTION_DAYS), DEFAULT_SETTINGS[CONF_LOG_RETENTION_DAYS], 1, 3650,
        ),
        CONF_MAX_PASSWORD_RETRIES: _clamp_int(
            data.get(CONF_MAX_PASSWORD_RETRIES), DEFAULT_SETTINGS[CONF_MAX_PASSWORD_RETRIES], 1, 100,
        ),
        CONF_LOCKOUT_MINUTES: _clamp_int(
            data.get(CONF_LOCKOUT_MINUTES), DEFAULT_SETTINGS[CONF_LOCKOUT_MINUTES], 1, 1440,
        ),
    }


def normalize_ui(data: dict | None) -> dict:
    """Normalize the visitor page UI customization block."""
    data = data or {}
    theme = data.get(UI_THEME, "light")
    if theme not in _THEMES:
        theme = "light"
    ui = {
        UI_THEME: theme,
        UI_CARD_BG: str(data.get(UI_CARD_BG) or "").strip(),
        UI_TEXT_COLOR: str(data.get(UI_TEXT_COLOR) or "").strip(),
        UI_ACCENT: str(data.get(UI_ACCENT) or "").strip(),
        UI_TITLE: str(data.get(UI_TITLE) or "").strip(),
        UI_FOOTER: str(data.get(UI_FOOTER) or "").strip(),
    }
    return ui


def normalize_entity(data: dict | None) -> dict:
    """Normalize one entity entry of a share. Raises ValueError on bad entity_id."""
    data = data or {}
    entity_id = str(data.get(ENTITY_FIELD_ENTITY_ID) or "").strip().lower()
    if not valid_entity_id(entity_id):
        raise ValueError(f"invalid entity_id: {entity_id!r}")

    mode = data.get(ENTITY_FIELD_MODE, MODE_READ)
    if mode not in _MODES:
        mode = MODE_READ

    limit = data.get(ENTITY_FIELD_LIMIT)
    if limit is not None:
        limit = max(1, int(limit))

    remaining = data.get(ENTITY_FIELD_REMAINING)
    if limit is None:
        remaining = None
    elif remaining is None:
        remaining = limit
    else:
        remaining = max(0, min(int(remaining), limit))

    name = data.get(ENTITY_FIELD_NAME)
    name = str(name).strip() if name else None

    icon = data.get(ENTITY_FIELD_ICON)
    icon = str(icon).strip() if icon else None

    return {
        ENTITY_FIELD_ENTITY_ID: entity_id,
        ENTITY_FIELD_NAME: name,
        ENTITY_FIELD_MODE: mode,
        ENTITY_FIELD_LIMIT: limit,
        ENTITY_FIELD_REMAINING: remaining,
        ENTITY_FIELD_ICON: icon,
        ENTITY_FIELD_SHOW_ATTRS: bool(data.get(ENTITY_FIELD_SHOW_ATTRS, True)),
    }


def normalize_share(data: dict | None) -> dict:
    """Normalize a full share object. Raises ValueError on invalid input."""
    data = data or {}

    share_id = data.get(FIELD_ID)
    if share_id is not None:
        share_id = str(share_id).lower()
        if not SHARE_ID_RE.match(share_id):
            raise ValueError("invalid share id")
    else:
        share_id = uuid.uuid4().hex

    entities: list[dict] = []
    seen: set[str] = set()
    for raw in data.get(FIELD_ENTITIES) or []:
        entity = normalize_entity(raw)
        if entity[ENTITY_FIELD_ENTITY_ID] in seen:
            continue
        seen.add(entity[ENTITY_FIELD_ENTITY_ID])
        entities.append(entity)

    poll = data.get(FIELD_POLL_INTERVAL)
    if poll is None:
        poll_interval = None
    else:
        poll_interval = _clamp_int(poll, DEFAULT_SETTINGS[CONF_POLL_INTERVAL],
                                   MIN_POLL_INTERVAL, MAX_POLL_INTERVAL)

    password_hash = data.get(FIELD_PASSWORD_HASH)
    if password_hash is not None and not isinstance(password_hash, str):
        password_hash = None

    return {
        FIELD_ID: share_id,
        FIELD_NAME: str(data.get(FIELD_NAME) or "").strip() or "未命名分享",
        FIELD_DESCRIPTION: str(data.get(FIELD_DESCRIPTION) or "").strip(),
        FIELD_CREATED_AT: _normalize_time(data.get(FIELD_CREATED_AT))
        or dt_util.utcnow().isoformat(),
        FIELD_ENABLED: bool(data.get(FIELD_ENABLED, True)),
        FIELD_START_TIME: _normalize_time(data.get(FIELD_START_TIME)),
        FIELD_END_TIME: _normalize_time(data.get(FIELD_END_TIME)),
        FIELD_PASSWORD_HASH: password_hash,
        FIELD_FAILED_ATTEMPTS: _clamp_int(data.get(FIELD_FAILED_ATTEMPTS), 0, 0, 100000),
        FIELD_LOCKED_UNTIL: _normalize_time(data.get(FIELD_LOCKED_UNTIL)),
        FIELD_POLL_INTERVAL: poll_interval,
        FIELD_UI: normalize_ui(data.get(FIELD_UI)),
        FIELD_ENTITIES: entities,
    }


def domain_of(entity_id: str) -> str:
    """Return the domain part of an entity id."""
    return entity_id.split(".", 1)[0]


def default_icon_for(entity_id: str) -> str:
    """Best-effort default Material icon for an entity."""
    return DOMAIN_ICONS.get(domain_of(entity_id), "mdi:flash")


def share_is_active(share: dict, now=None) -> tuple[bool, str]:
    """Check the per-share gate: enabled + time window. Lockout handled separately."""
    from .const import ERR_DISABLED, ERR_EXPIRED, ERR_NOT_STARTED

    if not share.get(FIELD_ENABLED, True):
        return False, ERR_DISABLED
    now = now or dt_util.utcnow()
    start = dt_util.parse_datetime(share.get(FIELD_START_TIME) or "")
    end = dt_util.parse_datetime(share.get(FIELD_END_TIME) or "")
    if start is not None and now < start:
        return False, ERR_NOT_STARTED
    if end is not None and now > end:
        return False, ERR_EXPIRED
    return True, ""


def share_is_locked(share: dict, now=None) -> bool:
    """Whether the share is temporarily locked after failed password attempts."""
    now = now or dt_util.utcnow()
    locked_until = dt_util.parse_datetime(share.get(FIELD_LOCKED_UNTIL) or "")
    return locked_until is not None and now < locked_until


def is_valid_share_id(share_id: str) -> bool:
    """Share ids are 32-char lowercase hex (uuid4)."""
    return bool(SHARE_ID_RE.match(share_id or ""))
