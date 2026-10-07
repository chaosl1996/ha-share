"""Constants for the HA Share integration."""
from __future__ import annotations

import logging

DOMAIN = "ha_share"
LOGGER = logging.getLogger(__package__)

VERSION = "1.0.5"

# ---------------------------------------------------------------------------
# Panel
# ---------------------------------------------------------------------------
PANEL_URL_PATH = "ha-share"
PANEL_COMPONENT_NAME = "ha-share-panel"
PANEL_TITLE = "HA Share"
PANEL_ICON = "mdi:share-variant-outline"
# The panel module is served at {PANEL_JS_URL}/{version}/panel.js. The version
# (file mtime) lives in the PATH, not a query string: the HA frontend service
# worker serves cached assets ignoring query params, so a query-based cache
# buster never reaches the network.
PANEL_JS_URL = "/api/ha_share/static"

# ---------------------------------------------------------------------------
# Storage
# ---------------------------------------------------------------------------
STORAGE_SETTINGS = "ha_share.settings"
STORAGE_SHARES = "ha_share.shares"
STORAGE_LOGS = "ha_share.logs"
STORAGE_VERSION = 1

MAX_LOG_ENTRIES = 5000

# ---------------------------------------------------------------------------
# Global settings keys & defaults
# ---------------------------------------------------------------------------
CONF_BASE_URL = "base_url"
CONF_POLL_INTERVAL = "poll_interval"
CONF_LOG_RETENTION_DAYS = "log_retention_days"
CONF_MAX_PASSWORD_RETRIES = "max_password_retries"
CONF_LOCKOUT_MINUTES = "lockout_minutes"

MIN_POLL_INTERVAL = 2
MAX_POLL_INTERVAL = 10

DEFAULT_SETTINGS = {
    CONF_BASE_URL: "",
    CONF_POLL_INTERVAL: 5,
    CONF_LOG_RETENTION_DAYS: 90,
    CONF_MAX_PASSWORD_RETRIES: 5,
    CONF_LOCKOUT_MINUTES: 10,
}

# ---------------------------------------------------------------------------
# Share / entity fields
# ---------------------------------------------------------------------------
FIELD_ID = "id"
FIELD_NAME = "name"
FIELD_DESCRIPTION = "description"
FIELD_CREATED_AT = "created_at"
FIELD_ENABLED = "enabled"
FIELD_START_TIME = "start_time"
FIELD_END_TIME = "end_time"
FIELD_PASSWORD_HASH = "password_hash"
FIELD_FAILED_ATTEMPTS = "failed_attempts"
FIELD_LOCKED_UNTIL = "locked_until"
FIELD_POLL_INTERVAL = "poll_interval"
FIELD_UI = "ui"
FIELD_ENTITIES = "entities"

ENTITY_FIELD_ENTITY_ID = "entity_id"
ENTITY_FIELD_NAME = "name"
ENTITY_FIELD_MODE = "mode"
ENTITY_FIELD_LIMIT = "limit"
ENTITY_FIELD_REMAINING = "remaining"
ENTITY_FIELD_ICON = "icon"
ENTITY_FIELD_SHOW_ATTRS = "show_attrs"
ENTITY_FIELD_ATTRS = "attrs"
ENTITY_FIELD_ATTR_NAMES = "attr_names"

MODE_READ = "read"
MODE_CONTROL = "control"

UI_THEME = "theme"
UI_CARD_BG = "card_bg"
UI_TEXT_COLOR = "text_color"
UI_ACCENT = "accent"
UI_TITLE = "title"
UI_FOOTER = "footer"

DEFAULT_UI = {
    UI_THEME: "light",
    UI_CARD_BG: "",
    UI_TEXT_COLOR: "",
    UI_ACCENT: "",
    UI_TITLE: "",
    UI_FOOTER: "",
}

# ---------------------------------------------------------------------------
# Audit log events
# ---------------------------------------------------------------------------
EVENT_PAGE_VIEW = "page_view"
EVENT_PASSWORD_OK = "password_ok"
EVENT_PASSWORD_FAIL = "password_fail"
EVENT_CALL_OK = "call_ok"
EVENT_CALL_FAIL = "call_fail"
EVENT_BLOCKED = "blocked"

LOG_FIELD_TIME = "t"
LOG_FIELD_IP = "ip"
LOG_FIELD_SHARE_ID = "share_id"
LOG_FIELD_SHARE_NAME = "share_name"
LOG_FIELD_EVENT = "event"
LOG_FIELD_ENTITY_ID = "entity_id"
LOG_FIELD_ACTION = "action"
LOG_FIELD_REMAINING_BEFORE = "remaining_before"
LOG_FIELD_DETAIL = "detail"

# ---------------------------------------------------------------------------
# Visitor API
# ---------------------------------------------------------------------------
HEADER_SHARE_KEY = "X-HA-Share-Key"

# Error codes returned to the visitor frontend
ERR_NOT_FOUND = "not_found"
ERR_DISABLED = "disabled"
ERR_NOT_STARTED = "not_started"
ERR_EXPIRED = "expired"
ERR_LOCKED = "locked"
ERR_PASSWORD_REQUIRED = "password_required"
ERR_PASSWORD_INVALID = "password_invalid"
ERR_READ_ONLY = "read_only"
ERR_EXHAUSTED = "exhausted"
ERR_ENTITY_UNAVAILABLE = "entity_unavailable"
ERR_ENTITY_NOT_IN_SHARE = "entity_not_in_share"
ERR_INVALID_SERVICE = "invalid_service"
ERR_SERVICE_FAILED = "service_failed"
ERR_INVALID_REQUEST = "invalid_request"

# Attributes stripped from the visitor payload entirely (UI noise, no control value).
# Control-relevant attributes (min_mireds, hvac_modes, options, ...) stay in the
# payload; the visitor page keeps its own display blacklist.
HIDDEN_ATTRIBUTES = frozenset(
    {
        "friendly_name",
        "icon",
        "entity_picture",
        "assumed_state",
        "restored",
        "supported_features",
        "device_class",
        "state_class",
        "editable",
        "code_format",
        "changed_by",
        # Group entities list their member entity_ids; visitors have no use
        # for it and it leaks the rest of the home's entity ids.
        "entity_id",
    }
)

# 域默认图标（管理面板实体选择器展示用）
DOMAIN_ICONS = {
    "air_quality": "mdi:air-filter",
    "alarm_control_panel": "mdi:shield-home",
    "automation": "mdi:robot",
    "binary_sensor": "mdi:checkbox-blank-circle-outline",
    "button": "mdi:gesture-tap-button",
    "calendar": "mdi:calendar",
    "camera": "mdi:cctv",
    "climate": "mdi:thermostat",
    "cover": "mdi:window-shutter",
    "device_tracker": "mdi:map-marker-radius",
    "fan": "mdi:fan",
    "humidifier": "mdi:air-humidifier",
    "input_boolean": "mdi:toggle-switch-outline",
    "input_button": "mdi:gesture-tap-button",
    "input_datetime": "mdi:calendar-clock",
    "input_number": "mdi:numeric",
    "input_select": "mdi:format-list-bulleted",
    "input_text": "mdi:form-textbox",
    "light": "mdi:lightbulb-outline",
    "lock": "mdi:lock-outline",
    "media_player": "mdi:cast",
    "number": "mdi:numeric",
    "person": "mdi:account",
    "scene": "mdi:palette-outline",
    "script": "mdi:script-text-outline",
    "select": "mdi:format-list-bulleted",
    "sensor": "mdi:eye",
    "siren": "mdi:bullhorn-outline",
    "switch": "mdi:toggle-switch",
    "text": "mdi:form-textbox",
    "todo": "mdi:clipboard-list-outline",
    "update": "mdi:package-up",
    "vacuum": "mdi:robot-vacuum",
    "valve": "mdi:valve",
    "water_heater": "mdi:water-boiler",
    "weather": "mdi:weather-partly-snowy-rainy",
}
