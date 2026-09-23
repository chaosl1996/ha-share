"""Visitor-facing HTTP endpoints for HA Share.

All endpoints are public (requires_auth=False): they are meant to be reached
by guests over the user's external HTTPS reverse proxy. Every handler first
resolves the share, then runs the global gate (exists -> enabled -> time
window -> lockout) and only then serves any data.
"""
from __future__ import annotations

import json
from pathlib import Path

from aiohttp import web
from homeassistant.components.http import KEY_HASS, HomeAssistantView
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import (
    CONF_POLL_INTERVAL,
    DOMAIN,
    ENTITY_FIELD_ENTITY_ID,
    ENTITY_FIELD_ICON,
    ENTITY_FIELD_LIMIT,
    ENTITY_FIELD_MODE,
    ENTITY_FIELD_NAME,
    ENTITY_FIELD_REMAINING,
    ENTITY_FIELD_SHOW_ATTRS,
    ERR_DISABLED,
    ERR_ENTITY_NOT_IN_SHARE,
    ERR_ENTITY_UNAVAILABLE,
    ERR_EXHAUSTED,
    ERR_EXPIRED,
    ERR_INVALID_REQUEST,
    ERR_INVALID_SERVICE,
    ERR_LOCKED,
    ERR_NOT_FOUND,
    ERR_NOT_STARTED,
    ERR_PASSWORD_REQUIRED,
    ERR_READ_ONLY,
    ERR_SERVICE_FAILED,
    EVENT_BLOCKED,
    EVENT_CALL_FAIL,
    EVENT_CALL_OK,
    EVENT_PAGE_VIEW,
    FIELD_DESCRIPTION,
    FIELD_ENABLED,
    FIELD_ENTITIES,
    FIELD_ID,
    FIELD_NAME,
    FIELD_PASSWORD_HASH,
    FIELD_POLL_INTERVAL,
    FIELD_UI,
    HIDDEN_ATTRIBUTES,
    HEADER_SHARE_KEY,
    LOGGER,
    MODE_CONTROL,
)
from .entity_actions import get_allowed_services, is_known_domain, validate_service_call
from .models import (
    default_icon_for,
    domain_of,
    is_valid_share_id,
    share_is_active,
    share_is_locked,
)
from .security import check_request_password, verify_with_attempt_tracking

_WWW_DIR = Path(__file__).parent / "www"

# error code -> HTTP status
_ERROR_STATUS = {
    ERR_NOT_FOUND: 404,
    ERR_ENTITY_NOT_IN_SHARE: 404,
    ERR_DISABLED: 410,
    ERR_NOT_STARTED: 410,
    ERR_EXPIRED: 410,
    ERR_LOCKED: 423,
    ERR_PASSWORD_REQUIRED: 401,
    ERR_READ_ONLY: 403,
    ERR_EXHAUSTED: 403,
    ERR_ENTITY_UNAVAILABLE: 409,
    ERR_INVALID_REQUEST: 400,
    ERR_INVALID_SERVICE: 400,
    ERR_SERVICE_FAILED: 500,
}


def _json_error(error_code: str, **extra) -> web.Response:
    payload = {"ok": False, "error": error_code}
    payload.update(extra)
    return web.json_response(payload, status=_ERROR_STATUS.get(error_code, 400))


def _get_storage(hass: HomeAssistant):
    return hass.data[DOMAIN]["storage"]


def _resolve_share(hass: HomeAssistant, share_id: str):
    """Resolve a share by id. Returns (storage, share) or (None, error_response)."""
    share_id = (share_id or "").lower()
    if not is_valid_share_id(share_id):
        return None, _json_error(ERR_NOT_FOUND)
    storage = _get_storage(hass)
    share = storage.get_share(share_id)
    if share is None:
        return None, _json_error(ERR_NOT_FOUND)
    return storage, share


def _check_gate(storage, share) -> web.Response | None:
    """Global gate: enabled -> time window -> lockout. Returns an error response or None."""
    if share_is_locked(share):
        return _json_error(ERR_LOCKED)
    ok, reason = share_is_active(share)
    if not ok:
        return _json_error(reason)
    return None


def _client_ip(request: web.Request) -> str:
    return request.remote or ""


def _entity_view(hass: HomeAssistant, entity: dict, actions: list[str] | None = None) -> dict:
    """Build the visitor-facing view of one bound entity."""
    entity_id = entity[ENTITY_FIELD_ENTITY_ID]
    state_obj = hass.states.get(entity_id)
    available = state_obj is not None and state_obj.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN)

    icon = entity.get(ENTITY_FIELD_ICON) or None
    if icon is None and state_obj is not None:
        icon = state_obj.attributes.get("icon")
    if not icon:
        icon = default_icon_for(entity_id)

    name = entity.get(ENTITY_FIELD_NAME) or None
    if name is None and state_obj is not None:
        name = state_obj.attributes.get("friendly_name")
    if not name:
        name = entity_id

    attributes: dict = {}
    if entity.get(ENTITY_FIELD_SHOW_ATTRS, True) and state_obj is not None:
        attributes = {
            key: value
            for key, value in state_obj.attributes.items()
            if key not in HIDDEN_ATTRIBUTES
            and isinstance(value, (str, int, float, bool, list))
        }

    view = {
        "entity_id": entity_id,
        "domain": domain_of(entity_id),
        "name": name,
        "icon": icon,
        "mode": entity[ENTITY_FIELD_MODE],
        "limit": entity.get(ENTITY_FIELD_LIMIT),
        "remaining": entity.get(ENTITY_FIELD_REMAINING),
        "available": available,
        "state": state_obj.state if state_obj is not None else None,
        "attributes": attributes,
    }
    if actions is not None:
        view["actions"] = actions
    return view


class ShareStaticPanelView(HomeAssistantView):
    """Serve the admin panel JS module (loaded inside the HA frontend)."""

    url = "/api/ha_share/static/{version}/panel.js"
    name = "api:ha_share:static:panel"
    requires_auth = False

    async def get(self, request: web.Request, version: str) -> web.Response:
        # {version} is a cache-busting path segment (panel.js mtime); the HA
        # frontend service worker ignores query strings when matching cached
        # assets, so the version must be part of the path.
        panel = _WWW_DIR / "panel.js"
        if not panel.exists():
            return web.Response(status=404)
        return web.FileResponse(
            panel,
            headers={
                "Cache-Control": "no-cache",
                "Content-Type": "text/javascript; charset=utf-8",
            },
        )


class SharePageView(HomeAssistantView):
    """Serve the visitor share page (static HTML, no entity data)."""

    url = "/share/{share_id}"
    extra_urls = ["/api/ha_share/{share_id}"]
    name = "api:ha_share:page"
    requires_auth = False

    async def get(self, request: web.Request, share_id: str) -> web.Response:
        hass = request.app[KEY_HASS]
        page = _WWW_DIR / "share.html"
        if not page.exists():
            return web.Response(status=404, text="share page missing")

        result = _resolve_share(hass, share_id)
        if result[0] is None:
            # Unknown share: still serve the page; its JS shows an
            # "invalid link" screen after /state returns 404.
            return web.FileResponse(page, headers={"Cache-Control": "no-cache"})
        storage, share = result

        if _check_gate(storage, share) is not None:
            await storage.async_log(
                EVENT_BLOCKED,
                ip=_client_ip(request),
                share=share,
                detail="page view blocked",
            )
        else:
            await storage.async_log(EVENT_PAGE_VIEW, ip=_client_ip(request), share=share)
        return web.FileResponse(page, headers={"Cache-Control": "no-cache"})


class ShareVerifyView(HomeAssistantView):
    """Password verification with brute-force protection."""

    url = "/share/{share_id}/verify"
    extra_urls = ["/api/ha_share/{share_id}/verify"]
    name = "api:ha_share:verify"
    requires_auth = False

    async def post(self, request: web.Request, share_id: str) -> web.Response:
        hass = request.app[KEY_HASS]
        storage, share_or_err = _resolve_share(hass, share_id)
        if storage is None:
            return share_or_err
        share = share_or_err

        if (gate := _check_gate(storage, share)) is not None:
            await storage.async_log(
                EVENT_BLOCKED, ip=_client_ip(request), share=share, detail="verify blocked"
            )
            return gate

        try:
            body = await request.json()
            password = str(body.get("password", "")) if isinstance(body, dict) else ""
        except (json.JSONDecodeError, UnicodeDecodeError):
            return _json_error(ERR_INVALID_REQUEST)

        ok, error_code, info = await verify_with_attempt_tracking(
            hass, storage, share, password, ip=_client_ip(request)
        )
        if not ok:
            resp = _json_error(error_code, **info)
            return resp
        return web.json_response({"ok": True, **info})


class ShareStateView(HomeAssistantView):
    """Snapshot of all bound entities for the visitor page."""

    url = "/share/{share_id}/state"
    extra_urls = ["/api/ha_share/{share_id}/state"]
    name = "api:ha_share:state"
    requires_auth = False

    async def get(self, request: web.Request, share_id: str) -> web.Response:
        hass = request.app[KEY_HASS]
        storage, share_or_err = _resolve_share(hass, share_id)
        if storage is None:
            return share_or_err
        share = share_or_err

        if (gate := _check_gate(storage, share)) is not None:
            return gate

        ok, error_code = await check_request_password(hass, share, request)
        if not ok:
            return _json_error(error_code)

        entities = []
        for entity in share.get(FIELD_ENTITIES, []):
            actions = None
            if entity[ENTITY_FIELD_MODE] == MODE_CONTROL:
                domain = domain_of(entity[ENTITY_FIELD_ENTITY_ID])
                if not is_known_domain(domain):
                    actions = get_allowed_services(hass, domain)
            entities.append(_entity_view(hass, entity, actions))

        payload = {
            "ok": True,
            "name": share.get(FIELD_NAME, ""),
            "description": share.get(FIELD_DESCRIPTION, ""),
            "ui": share.get(FIELD_UI, {}),
            "poll_interval": share.get(FIELD_POLL_INTERVAL)
            or storage.settings.get(CONF_POLL_INTERVAL, 5),
            "password_protected": bool(share.get(FIELD_PASSWORD_HASH)),
            "server_time": dt_util.utcnow().isoformat(),
            "entities": entities,
        }
        return web.json_response(payload)


class ShareCallView(HomeAssistantView):
    """Execute a control action on one bound entity."""

    url = "/share/{share_id}/call"
    extra_urls = ["/api/ha_share/{share_id}/call"]
    name = "api:ha_share:call"
    requires_auth = False

    async def post(self, request: web.Request, share_id: str) -> web.Response:
        hass = request.app[KEY_HASS]
        storage, share_or_err = _resolve_share(hass, share_id)
        if storage is None:
            return share_or_err
        share = share_or_err

        if (gate := _check_gate(storage, share)) is not None:
            await storage.async_log(
                EVENT_BLOCKED, ip=_client_ip(request), share=share, detail="call blocked"
            )
            return gate

        ok, error_code = await check_request_password(hass, share, request)
        if not ok:
            return _json_error(error_code)

        try:
            body = await request.json()
            assert isinstance(body, dict)
            entity_id = str(body.get("entity_id", "")).strip().lower()
            service = str(body.get("service", "")).strip()
            data = body.get("data") or {}
            if not isinstance(data, dict):
                raise ValueError("data must be an object")
        except (json.JSONDecodeError, UnicodeDecodeError, AssertionError, ValueError):
            return _json_error(ERR_INVALID_REQUEST)

        entity = None
        for candidate in share.get(FIELD_ENTITIES, []):
            if candidate[ENTITY_FIELD_ENTITY_ID] == entity_id:
                entity = candidate
                break
        if entity is None:
            await storage.async_log(
                EVENT_BLOCKED,
                ip=_client_ip(request),
                share=share,
                entity_id=entity_id or None,
                detail=ERR_ENTITY_NOT_IN_SHARE,
            )
            return _json_error(ERR_ENTITY_NOT_IN_SHARE)

        async def blocked(code: str) -> web.Response:
            await storage.async_log(
                EVENT_BLOCKED,
                ip=_client_ip(request),
                share=share,
                entity_id=entity_id,
                action=f"{domain_of(entity_id)}.{service}" if service else None,
                detail=code,
            )
            return _json_error(code)

        if entity[ENTITY_FIELD_MODE] != MODE_CONTROL:
            return await blocked(ERR_READ_ONLY)

        state_obj = hass.states.get(entity_id)
        if state_obj is None or state_obj.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            return await blocked(ERR_ENTITY_UNAVAILABLE)

        remaining = entity.get(ENTITY_FIELD_REMAINING)
        if remaining is not None and remaining <= 0:
            return await blocked(ERR_EXHAUSTED)

        domain = domain_of(entity_id)
        if not validate_service_call(hass, domain, service):
            await storage.async_log(
                EVENT_CALL_FAIL,
                ip=_client_ip(request),
                share=share,
                entity_id=entity_id,
                action=f"{domain}.{service}" if service else None,
                detail=ERR_INVALID_SERVICE,
            )
            return _json_error(ERR_INVALID_SERVICE)

        # Reserve-then-confirm: decrement first (persisted), refund on failure.
        remaining_before = remaining
        if remaining is not None:
            entity[ENTITY_FIELD_REMAINING] = remaining - 1
            await storage.async_save_shares()

        service_data = {key: value for key, value in data.items() if key != "entity_id"}
        service_data["entity_id"] = entity_id

        try:
            await hass.services.async_call(
                domain, service, service_data, blocking=True
            )
        except Exception as err:  # noqa: BLE001 - refund any service failure
            LOGGER.warning("ha_share service call failed: %s.%s: %s", domain, service, err)
            if remaining is not None:
                entity[ENTITY_FIELD_REMAINING] = remaining
                await storage.async_save_shares()
            await storage.async_log(
                EVENT_CALL_FAIL,
                ip=_client_ip(request),
                share=share,
                entity_id=entity_id,
                action=f"{domain}.{service}",
                remaining_before=remaining_before,
                detail=str(err)[:200],
            )
            return _json_error(ERR_SERVICE_FAILED)

        await storage.async_log(
            EVENT_CALL_OK,
            ip=_client_ip(request),
            share=share,
            entity_id=entity_id,
            action=f"{domain}.{service}",
            remaining_before=remaining_before,
        )
        actions = None
        if not is_known_domain(domain):
            actions = get_allowed_services(hass, domain)
        return web.json_response(
            {
                "ok": True,
                "remaining": entity.get(ENTITY_FIELD_REMAINING),
                "entity": _entity_view(hass, entity, actions),
            }
        )
