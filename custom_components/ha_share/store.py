"""Persistent storage for HA Share (HA .storage JSON files)."""
from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    CONF_LOG_RETENTION_DAYS,
    ENTITY_FIELD_ENTITY_ID,
    ENTITY_FIELD_LIMIT,
    ENTITY_FIELD_MODE,
    ENTITY_FIELD_REMAINING,
    FIELD_ENABLED,
    FIELD_ENTITIES,
    FIELD_FAILED_ATTEMPTS,
    FIELD_ID,
    FIELD_LOCKED_UNTIL,
    FIELD_NAME,
    FIELD_PASSWORD_HASH,
    LOG_FIELD_ACTION,
    LOG_FIELD_DETAIL,
    LOG_FIELD_ENTITY_ID,
    LOG_FIELD_EVENT,
    LOG_FIELD_IP,
    LOG_FIELD_REMAINING_BEFORE,
    LOG_FIELD_SHARE_ID,
    LOG_FIELD_SHARE_NAME,
    LOG_FIELD_TIME,
    MAX_LOG_ENTRIES,
    MODE_CONTROL,
    STORAGE_LOGS,
    STORAGE_SETTINGS,
    STORAGE_SHARES,
    STORAGE_VERSION,
)
from .models import (
    normalize_settings,
    normalize_share,
    share_is_locked,
)
from .security import hash_password


class HaShareStorage:
    """Manage settings, shares and audit logs persisted via HA .storage."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._settings_store = Store(hass, STORAGE_VERSION, STORAGE_SETTINGS)
        self._shares_store = Store(hass, STORAGE_VERSION, STORAGE_SHARES)
        self._logs_store = Store(hass, STORAGE_VERSION, STORAGE_LOGS)
        self.settings: dict = {}
        self.shares: list[dict] = []
        self.logs: list[dict] = []

    # ------------------------------------------------------------------
    # Load
    # ------------------------------------------------------------------
    async def async_load(self) -> None:
        settings = await self._settings_store.async_load() or {}
        self.settings = normalize_settings(settings)

        shares_data = await self._shares_store.async_load() or {}
        self.shares = []
        for raw in shares_data.get("shares", []):
            try:
                self.shares.append(normalize_share(raw))
            except ValueError:
                # Skip corrupt entries rather than failing setup
                continue

        logs_data = await self._logs_store.async_load() or {}
        self.logs = [
            entry for entry in logs_data.get("logs", []) if isinstance(entry, dict)
        ]
        self._prune_logs()

    # ------------------------------------------------------------------
    # Settings
    # ------------------------------------------------------------------
    async def async_update_settings(self, data: dict | None) -> dict:
        self.settings = normalize_settings(data)
        await self._settings_store.async_save(self.settings)
        return self.settings

    # ------------------------------------------------------------------
    # Shares
    # ------------------------------------------------------------------
    def get_share(self, share_id: str) -> dict | None:
        for share in self.shares:
            if share[FIELD_ID] == share_id:
                return share
        return None

    async def async_save_share(self, data: dict) -> dict:
        """Create or update a share. Password handling:
        - "password": "..." (plain, non-empty)  -> (re)set password
        - "password": "" or None                -> keep existing hash
        - "clear_password": True                -> remove password
        """
        existing = self.get_share(str(data.get(FIELD_ID) or "")) if data.get(FIELD_ID) else None

        payload = dict(data)
        if existing is not None:
            # Keep runtime fields unless explicitly provided
            for key in (FIELD_FAILED_ATTEMPTS, FIELD_LOCKED_UNTIL):
                if key not in payload:
                    payload[key] = existing.get(key)

        new_password = payload.pop("password", None)
        clear_password = payload.pop("clear_password", False)
        if clear_password:
            payload[FIELD_PASSWORD_HASH] = None
        elif isinstance(new_password, str) and new_password:
            payload[FIELD_PASSWORD_HASH] = await self.hass.async_add_executor_job(
                hash_password, new_password
            )
        elif existing is not None:
            payload[FIELD_PASSWORD_HASH] = existing.get(FIELD_PASSWORD_HASH)
        else:
            payload[FIELD_PASSWORD_HASH] = None

        # Preserve remaining counters for unchanged entities when the panel
        # did not send an explicit "remaining" value.
        if existing is not None:
            old_entities = {
                e[ENTITY_FIELD_ENTITY_ID]: e for e in existing.get(FIELD_ENTITIES, [])
            }
            for raw in payload.get(FIELD_ENTITIES) or []:
                old = old_entities.get(str(raw.get(ENTITY_FIELD_ENTITY_ID) or "").lower())
                if old is None:
                    continue
                if ENTITY_FIELD_REMAINING not in raw and ENTITY_FIELD_LIMIT in raw:
                    # keep counter when limit is unchanged, else reset via normalize
                    if raw.get(ENTITY_FIELD_LIMIT) == old.get(ENTITY_FIELD_LIMIT):
                        raw[ENTITY_FIELD_REMAINING] = old.get(ENTITY_FIELD_REMAINING)

        share = normalize_share(payload)
        if existing is None:
            self.shares.append(share)
        else:
            self.shares[self.shares.index(existing)] = share
        await self.async_save_shares()
        return share

    async def async_save_shares(self) -> None:
        await self._shares_store.async_save({"shares": self.shares})

    async def async_delete_share(self, share_id: str) -> bool:
        share = self.get_share(share_id)
        if share is None:
            return False
        self.shares.remove(share)
        await self.async_save_shares()
        return True

    async def async_set_enabled(self, share_id: str, enabled: bool) -> dict | None:
        share = self.get_share(share_id)
        if share is None:
            return None
        share[FIELD_ENABLED] = bool(enabled)
        await self.async_save_shares()
        return share

    async def async_reset_counters(self, share_id: str) -> dict | None:
        """Reset remaining = limit for every control entity of the share."""
        share = self.get_share(share_id)
        if share is None:
            return None
        for entity in share.get(FIELD_ENTITIES, []):
            if entity[ENTITY_FIELD_MODE] == MODE_CONTROL:
                entity[ENTITY_FIELD_REMAINING] = entity[ENTITY_FIELD_LIMIT]
        await self.async_save_shares()
        return share

    # ------------------------------------------------------------------
    # Audit logs
    # ------------------------------------------------------------------
    async def async_log(
        self,
        event: str,
        *,
        ip: str = "",
        share: dict | None = None,
        entity_id: str | None = None,
        action: str | None = None,
        remaining_before: int | None = None,
        detail: str = "",
    ) -> None:
        entry = {
            LOG_FIELD_TIME: dt_util.utcnow().isoformat(),
            LOG_FIELD_IP: str(ip or ""),
            LOG_FIELD_SHARE_ID: share.get(FIELD_ID, "") if share else "",
            LOG_FIELD_SHARE_NAME: share.get(FIELD_NAME, "") if share else "",
            LOG_FIELD_EVENT: event,
            LOG_FIELD_ENTITY_ID: entity_id,
            LOG_FIELD_ACTION: action,
            LOG_FIELD_REMAINING_BEFORE: remaining_before,
            LOG_FIELD_DETAIL: str(detail or ""),
        }
        self.logs.append(entry)
        self._prune_logs()
        await self._logs_store.async_save({"logs": self.logs})

    def query_logs(
        self,
        *,
        share_id: str | None = None,
        start: str | None = None,
        end: str | None = None,
        limit: int = 200,
        offset: int = 0,
    ) -> tuple[list[dict], int]:
        """Return filtered logs (newest first) plus the total match count."""
        start_dt = dt_util.parse_datetime(start) if start else None
        end_dt = dt_util.parse_datetime(end) if end else None
        if start_dt is not None and start_dt.tzinfo is None:
            start_dt = start_dt.replace(tzinfo=dt_util.DEFAULT_TIME_ZONE)
        if end_dt is not None and end_dt.tzinfo is None:
            end_dt = end_dt.replace(tzinfo=dt_util.DEFAULT_TIME_ZONE)

        matched: list[dict] = []
        for entry in self.logs:
            if share_id and entry.get(LOG_FIELD_SHARE_ID) != share_id:
                continue
            t = dt_util.parse_datetime(entry.get(LOG_FIELD_TIME) or "")
            if start_dt is not None and (t is None or t < start_dt):
                continue
            if end_dt is not None and (t is None or t > end_dt):
                continue
            matched.append(entry)

        matched.reverse()  # newest first
        total = len(matched)
        return matched[offset : offset + limit], total

    def _prune_logs(self) -> None:
        """Drop logs older than the retention window and cap the list size."""
        days = self.settings.get(CONF_LOG_RETENTION_DAYS, 90)
        cutoff = dt_util.utcnow().timestamp() - days * 86400
        pruned = []
        for entry in self.logs:
            t = dt_util.parse_datetime(entry.get(LOG_FIELD_TIME) or "")
            if t is not None and t.timestamp() >= cutoff:
                pruned.append(entry)
        if len(pruned) > MAX_LOG_ENTRIES:
            pruned = pruned[-MAX_LOG_ENTRIES:]
        if len(pruned) != len(self.logs):
            self.logs = pruned

    # ------------------------------------------------------------------
    # Visitor helpers (runtime password state)
    # ------------------------------------------------------------------
    def is_password_protected(self, share: dict) -> bool:
        return bool(share.get(FIELD_PASSWORD_HASH))

    def is_locked(self, share: dict) -> bool:
        return share_is_locked(share)
