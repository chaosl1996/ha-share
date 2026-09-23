"""Admin websocket commands for the HA Share panel.

Every command requires an admin user; the panel itself is also registered
with require_admin, giving two layers of enforcement.
"""
from __future__ import annotations

import asyncio

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    CONF_BASE_URL,
    DOMAIN,
    ERR_NOT_FOUND,
    FIELD_ID,
    FIELD_PASSWORD_HASH,
    LOGGER,
)
from .entity_actions import get_allowed_services
from .qr import generate_qr_data_url
from .security import generate_random_password

_STR = vol.Maybe(str)


def _storage(hass: HomeAssistant):
    return hass.data[DOMAIN]["storage"]


def effective_base_url(hass: HomeAssistant) -> str | None:
    """The base URL used to build share links."""
    settings = _storage(hass).settings
    base = settings.get(CONF_BASE_URL, "")
    if base:
        return base
    ext = hass.config.external_url or hass.config.internal_url
    return ext.rstrip("/") if ext else None


def build_share_url(hass: HomeAssistant, share: dict) -> str | None:
    base = effective_base_url(hass)
    if not base:
        return None
    return f"{base}/share/{share[FIELD_ID]}"


def _share_public(hass: HomeAssistant, share: dict) -> dict:
    """Share payload for the admin panel (password hash stripped)."""
    out = {key: value for key, value in share.items() if key != FIELD_PASSWORD_HASH}
    out["has_password"] = bool(share.get(FIELD_PASSWORD_HASH))
    out["url"] = build_share_url(hass, share)
    return out


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------
@websocket_api.websocket_command({vol.Required("type"): "ha_share/settings/get"})
@websocket_api.require_admin
@callback
def ws_settings_get(hass: HomeAssistant, connection, msg) -> None:
    connection.send_result(
        msg["id"],
        {
            "settings": _storage(hass).settings,
            "effective_base_url": effective_base_url(hass),
            "version": hass.data[DOMAIN].get("version", "1.0.0"),
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "ha_share/settings/save",
        vol.Required("settings"): dict,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_settings_save(hass: HomeAssistant, connection, msg) -> None:
    settings = await _storage(hass).async_update_settings(msg["settings"])
    connection.send_result(
        msg["id"], {"settings": settings, "effective_base_url": effective_base_url(hass)}
    )


# ---------------------------------------------------------------------------
# Shares
# ---------------------------------------------------------------------------
@websocket_api.websocket_command({vol.Required("type"): "ha_share/shares/list"})
@websocket_api.require_admin
@callback
def ws_shares_list(hass: HomeAssistant, connection, msg) -> None:
    storage = _storage(hass)
    connection.send_result(
        msg["id"], {"shares": [_share_public(hass, s) for s in storage.shares]}
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "ha_share/shares/save",
        vol.Required("share"): dict,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_shares_save(hass: HomeAssistant, connection, msg) -> None:
    try:
        share = await _storage(hass).async_save_share(msg["share"])
    except (ValueError, TypeError) as err:
        connection.send_error(msg["id"], "invalid_share", str(err))
        return
    connection.send_result(msg["id"], {"share": _share_public(hass, share)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "ha_share/shares/delete",
        vol.Required("share_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_shares_delete(hass: HomeAssistant, connection, msg) -> None:
    ok = await _storage(hass).async_delete_share(msg["share_id"])
    if not ok:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "share not found")
        return
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "ha_share/shares/toggle",
        vol.Required("share_id"): str,
        vol.Required("enabled"): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_shares_toggle(hass: HomeAssistant, connection, msg) -> None:
    share = await _storage(hass).async_set_enabled(msg["share_id"], msg["enabled"])
    if share is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "share not found")
        return
    connection.send_result(msg["id"], {"share": _share_public(hass, share)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "ha_share/shares/reset_counters",
        vol.Required("share_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_shares_reset_counters(hass: HomeAssistant, connection, msg) -> None:
    share = await _storage(hass).async_reset_counters(msg["share_id"])
    if share is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "share not found")
        return
    connection.send_result(msg["id"], {"share": _share_public(hass, share)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "ha_share/qr",
        vol.Required("share_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_share_qr(hass: HomeAssistant, connection, msg) -> None:
    share = _storage(hass).get_share(msg["share_id"])
    if share is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "share not found")
        return
    url = build_share_url(hass, share)
    if not url:
        connection.send_error(msg["id"], "no_base_url", "base url is not configured")
        return
    png = await hass.async_add_executor_job(generate_qr_data_url, url)
    connection.send_result(msg["id"], {"url": url, "png": png})


# ---------------------------------------------------------------------------
# Audit logs
# ---------------------------------------------------------------------------
@websocket_api.websocket_command(
    {
        vol.Required("type"): "ha_share/logs/query",
        vol.Optional("share_id"): _STR,
        vol.Optional("start"): _STR,
        vol.Optional("end"): _STR,
        vol.Optional("limit", default=200): vol.All(int, vol.Range(min=1, max=1000)),
        vol.Optional("offset", default=0): vol.All(int, vol.Range(min=0)),
    }
)
@websocket_api.require_admin
@callback
def ws_logs_query(hass: HomeAssistant, connection, msg) -> None:
    logs, total = _storage(hass).query_logs(
        share_id=msg.get("share_id") or None,
        start=msg.get("start") or None,
        end=msg.get("end") or None,
        limit=msg["limit"],
        offset=msg["offset"],
    )
    connection.send_result(msg["id"], {"logs": logs, "total": total})


# ---------------------------------------------------------------------------
# Misc helpers
# ---------------------------------------------------------------------------
@websocket_api.websocket_command(
    {
        vol.Required("type"): "ha_share/domain_services",
        vol.Required("domain"): str,
    }
)
@websocket_api.require_admin
@callback
def ws_domain_services(hass: HomeAssistant, connection, msg) -> None:
    connection.send_result(
        msg["id"], {"services": get_allowed_services(hass, msg["domain"])}
    )


@websocket_api.websocket_command({vol.Required("type"): "ha_share/generate_password"})
@websocket_api.require_admin
@callback
def ws_generate_password(hass: HomeAssistant, connection, msg) -> None:
    connection.send_result(msg["id"], {"password": generate_random_password()})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "ha_share/check_url",
        vol.Required("url"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_check_url(hass: HomeAssistant, connection, msg) -> None:
    """Connectivity self-check for the external base URL."""
    url = msg["url"].strip()
    if not url.startswith(("http://", "https://")):
        connection.send_result(msg["id"], {"ok": False, "error": "invalid_url"})
        return
    session = async_get_clientsession(hass)
    try:
        resp = await session.get(
            url, timeout=10, allow_redirects=True, ssl=False
        )
        connection.send_result(msg["id"], {"ok": True, "status": resp.status})
    except asyncio.TimeoutError:
        connection.send_result(msg["id"], {"ok": False, "error": "timeout"})
    except Exception as err:  # noqa: BLE001
        LOGGER.debug("ha_share url check failed: %s", err)
        connection.send_result(msg["id"], {"ok": False, "error": str(err)[:120]})


def async_register_admin_commands(hass: HomeAssistant) -> None:
    """Register all ha_share websocket commands."""
    for command in (
        ws_settings_get,
        ws_settings_save,
        ws_shares_list,
        ws_shares_save,
        ws_shares_delete,
        ws_shares_toggle,
        ws_shares_reset_counters,
        ws_share_qr,
        ws_logs_query,
        ws_domain_services,
        ws_generate_password,
        ws_check_url,
    ):
        websocket_api.async_register_command(hass, command)
