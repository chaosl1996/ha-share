"""QR code generation for share links."""
from __future__ import annotations

import base64
import io

import qrcode


def generate_qr_data_url(url: str) -> str:
    """Render a share URL as a base64-encoded PNG data URL."""
    img = qrcode.make(url, box_size=10, border=2)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
