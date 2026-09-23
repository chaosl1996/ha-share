"""Config flow for HA Share."""
from __future__ import annotations

from typing import Any

from homeassistant import config_entries
from homeassistant.core import callback

from .const import DOMAIN


class HaShareConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle the HA Share config flow."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None):
        """Single step: no fields, everything is configured in the panel."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        return self.async_create_entry(title="HA Share", data={})
