"""Entity service discovery and validation for HA Share."""
from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv

from .const import LOGGER

# Curated, ordered control services for well-known domains. The visitor page
# renders rich native controls for these domains.
CURATED_SERVICES: dict[str, list[str]] = {
    "light": ["turn_on", "turn_off", "toggle"],
    "switch": ["turn_on", "turn_off", "toggle"],
    "fan": ["turn_on", "turn_off", "toggle", "set_percentage", "set_preset_mode"],
    "lock": ["lock", "unlock", "open"],
    "cover": ["open_cover", "close_cover", "stop_cover", "set_cover_position", "toggle"],
    "climate": [
        "set_hvac_mode", "set_temperature", "set_fan_mode",
        "set_preset_mode", "set_humidity", "turn_on", "turn_off",
    ],
    "media_player": [
        "turn_on", "turn_off", "toggle", "volume_up", "volume_down",
        "volume_set", "volume_mute", "media_play_pause", "media_play",
        "media_pause", "media_next_track", "media_previous_track",
        "select_source", "select_sound_mode",
    ],
    "humidifier": ["turn_on", "turn_off", "set_humidity", "set_mode"],
    "water_heater": ["turn_on", "turn_off", "set_temperature", "set_operation_mode"],
    "vacuum": ["turn_on", "turn_off", "start", "pause", "stop",
               "return_to_base", "start_pause", "toggle", "clean_spot"],
    "button": ["press"],
    "input_button": ["press"],
    "scene": ["turn_on"],
    "script": ["turn_on", "turn_off", "toggle"],
    "automation": ["turn_on", "turn_off", "toggle", "trigger"],
    "input_boolean": ["turn_on", "turn_off", "toggle"],
    "input_number": ["set_value"],
    "input_select": ["select_option"],
    "input_text": ["set_value"],
    "select": ["select_option", "select_first", "select_last", "select_next",
               "select_previous"],
    "number": ["set_value"],
    "text": ["set_value"],
    "siren": ["turn_on", "turn_off"],
    "valve": ["open_valve", "close_valve", "stop_valve", "set_valve_position"],
    "alarm_control_panel": ["alarm_arm_away", "alarm_arm_home", "alarm_disarm",
                            "alarm_arm_night", "alarm_trigger"],
}

# Services never offered to visitors even when registered for the domain.
DENYLIST = {
    "light": {"reload"},
    "script": {"reload"},
    "automation": {"reload"},
    "scene": {"reload"},
    "group": {"reload"},
    "zone": {"reload"},
}


def is_known_domain(domain: str) -> bool:
    """Whether the visitor page renders curated rich controls for this domain."""
    return domain in CURATED_SERVICES


def _schema_accepts_entity(schema: Any) -> bool:
    """Whether a registered service schema is an entity service schema."""
    if schema is None:
        return False
    try:
        return bool(cv.is_entity_service_schema(schema))
    except Exception:  # noqa: BLE001 - defensive against exotic validators
        return False


def get_allowed_services(hass: HomeAssistant, domain: str) -> list[str]:
    """All services a visitor may call on entities of this domain.

    Curated services are trusted when registered; any other registered
    service is only allowed when its schema accepts entity_id targeting.
    """
    registered = hass.services.async_services_for_domain(domain)
    if not registered:
        return []
    curated = CURATED_SERVICES.get(domain, [])
    deny = DENYLIST.get(domain, set())

    allowed: list[str] = []
    for name in curated:
        if name in registered:
            allowed.append(name)
    for name, service in registered.items():
        if name in curated or name in deny:
            continue
        if _schema_accepts_entity(getattr(service, "schema", None)):
            allowed.append(name)
    return allowed


def validate_service_call(
    hass: HomeAssistant, domain: str, service: str
) -> bool:
    """Whether the (domain, service) pair may be invoked by a visitor."""
    if not service or "." in service or len(service) > 64:
        return False
    if service in DENYLIST.get(domain, set()):
        return False
    if service in CURATED_SERVICES.get(domain, []):
        return hass.services.has_service(domain, service)
    registered = hass.services.async_services_for_domain(domain).get(service)
    if registered is None:
        return False
    return _schema_accepts_entity(getattr(registered, "schema", None))
