import os, httpx

class PDFExportError(Exception):
    pass

API2PDF_ENDPOINT = "https://v2.api2pdf.com/chrome/pdf/html"
API2PDF_KEY = os.environ["API2PDF_KEY"]

async def html_to_pdf_via_api2pdf(html: str) -> bytes:
    """
    Send raw HTML to Api2Pdf (Headless Chrome) -> get a temporary FileUrl -> download bytes.
    Returns: PDF bytes (same behavior as your current PDFShift helper).
    """
    # 1) Convert HTML -> FileUrl
    payload = {
        "html": html,
        "options": {
            # Parity with your PDFShift settings
            "printBackground": True,       # like use_print=True
            "landscape": False,
            # Mirror @page margin: 16mm on all sides
            "marginTop": "16mm",
            "marginRight": "16mm",
            "marginBottom": "16mm",
            "marginLeft": "16mm",
            # Optional: set explicit A4 (your CSS already sets @page A4, so this is optional)
            # "width": "8.27in",
            # "height": "11.69in",
        }
    }

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            API2PDF_ENDPOINT,
            headers={"Authorization": API2PDF_KEY, "Content-Type": "application/json"},
            json=payload
        )
        if resp.status_code >= 400:
            try:
                detail = resp.json()
            except Exception:
                detail = resp.text
            raise PDFExportError(f"Api2Pdf convert error: {detail}")

        data = resp.json()
        file_url = data.get("FileUrl")
        if not file_url:
            raise PDFExportError(f"Missing FileUrl in Api2Pdf response: {data}")

        # 2) Download the generated PDF bytes (keeps your old return-bytes behavior)
        pdf_resp = await client.get(file_url)
        if pdf_resp.status_code >= 400:
            raise PDFExportError(f"Failed to fetch PDF bytes from FileUrl: {pdf_resp.text}")

        return pdf_resp.content
