import os, httpx

class PDFExportError(Exception):
    pass

async def html_to_pdf_via_pdfshift(html: str) -> bytes:
    """
    Send raw HTML to PDFShift and get PDF bytes back.
    """
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.pdfshift.io/v3/convert/pdf",
            headers={"X-API-Key": os.environ["PDFSHIFT_API_KEY"]},
            json={
                "source": html,        # raw HTML string
                "use_print": True,     # use print styles
                "landscape": False,
                "margin": {
                    "top": "16mm",
                    "right": "16mm",
                    "bottom": "16mm",
                    "left": "16mm"
                }
            },
        )
        if resp.status_code >= 400:
            try:
                raise PDFExportError(resp.json())
            except Exception:
                resp.raise_for_status()
        return resp.content
