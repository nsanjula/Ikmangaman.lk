# backend/services/pdf_via_pdflayer.py
import os
import httpx

PDFLAYER_ENDPOINT = "https://api.pdflayer.com/api/convert"

class PDFExportError(Exception):
    pass

async def html_to_pdf_via_pdflayer(html: str, *, test_mode: bool = False) -> bytes:
    """
    Send raw HTML to pdflayer and get PDF bytes back.
    Set test_mode=True to use pdflayer's test mode (won't consume quota).
    """
    params = {
        "access_key": os.environ["PDFLAYER_API_KEY"],
        "force": 1,
        "page_size": "A4",
        "margin_top": 0.63,
        "margin_right": 0.63,
        "margin_bottom": 0.63,
        "margin_left": 0.63,
        "background": 1,
    }
    if test_mode:
        params["test"] = 1  # free test mode

    data = {"document_html": html}

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(PDFLAYER_ENDPOINT, params=params, data=data)

        # If pdflayer returns JSON, it's usually an error payload
        content_type = resp.headers.get("Content-Type", "")
        if resp.status_code >= 400 or "application/json" in content_type:
            try:
                err = resp.json()
            except Exception:
                resp.raise_for_status()
            raise PDFExportError(str(err))

        return resp.content
