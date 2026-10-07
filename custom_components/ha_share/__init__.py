"""The HA Share integration: entity sharing gateway with per-entity quotas."""
from __future__ import annotations

import json
from datetime import timedelta
from pathlib import Path

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .admin_ws import async_register_admin_commands
from .const import (
    DOMAIN,
    LOGGER,
    PANEL_COMPONENT_NAME,
    PANEL_ICON,
    PANEL_JS_URL,
    PANEL_TITLE,
    PANEL_URL_PATH,
    VERSION,
)
from .store import HaShareStorage
from .visitor_api import (
    ShareCallView,
    SharePageView,
    ShareStateView,
    ShareStaticPanelView,
    ShareVerifyView,
)

PLATFORMS: list[Platform] = []

_VISITOR_VIEWS = (
    ShareStaticPanelView,
    SharePageView,
    ShareVerifyView,
    ShareStateView,
    ShareCallView,
)


def _manifest_version() -> str:
    """Single source of truth for the reported version: manifest.json."""
    try:
        with open(Path(__file__).parent / "manifest.json", encoding="utf-8") as fp:
            return json.load(fp).get("version") or VERSION
    except (OSError, ValueError):
        return VERSION


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up HA Share from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    domain_data = hass.data[DOMAIN]

    if "storage" not in domain_data:
        storage = HaShareStorage(hass)
        await storage.async_load()
        domain_data["storage"] = storage
    domain_data["version"] = _manifest_version()

    # Visitor HTTP endpoints are registered exactly once per HA process:
    # handlers resolve storage through hass.data at request time, so
    # integration reloads reuse the existing routes.
    if not domain_data.get("views_registered"):
        for view in _VISITOR_VIEWS:
            hass.http.register_view(view())
        domain_data["views_registered"] = True

    async_register_admin_commands(hass)

    # Sidebar panel (admin only), no YAML needed from the user.
    from homeassistant.components.panel_custom import async_register_panel

    # Bust the browser module cache per build: the URL changes whenever
    # panel.js is rebuilt (mtime-based), forcing a fresh fetch.
    panel_file = Path(__file__).parent / "www" / "panel.js"
    panel_version = str(int(panel_file.stat().st_mtime)) if panel_file.exists() else VERSION
    await async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name=PANEL_COMPONENT_NAME,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=f"{PANEL_JS_URL}/{panel_version}/panel.js",
        require_admin=True,
    )

    # Daily audit-log retention prune.
    if "prune_listener" not in domain_data:

        async def _async_prune(_now) -> None:
            storage: HaShareStorage | None = hass.data.get(DOMAIN, {}).get("storage")
            if storage is None:
                return
            try:
                storage._prune_logs()
                await storage.async_save_logs()
            except Exception:  # noqa: BLE001
                LOGGER.exception("ha_share log prune failed")

        from homeassistant.helpers.event import async_track_time_interval

        domain_data["prune_listener"] = async_track_time_interval(
            hass, _async_prune, timedelta(hours=24)
        )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a HA Share config entry."""
    domain_data = hass.data.get(DOMAIN, {})

    if remove_prune := domain_data.pop("prune_listener", None):
        remove_prune()

    from homeassistant.components.frontend import async_remove_panel

    async_remove_panel(hass, PANEL_URL_PATH)
    return True
