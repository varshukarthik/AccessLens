import io
from typing import Tuple
from fastapi import UploadFile, HTTPException

def extract_text_from_file(file: UploadFile, content_bytes: bytes) -> Tuple[str, str]:
    """
    Extracts plain text from uploaded PDF, DOCX, TXT, or MD files.
    Returns (extracted_text, file_type)
    """
    filename = file.filename or "unknown.txt"
    extension = filename.split(".")[-1].lower() if "." in filename else "txt"

    if extension not in ["pdf", "docx", "txt", "md"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '.{extension}'. Supported formats: PDF, DOCX, TXT, MD"
        )

    try:
        if extension == "pdf":
            import pypdf
            pdf_reader = pypdf.PdfReader(io.BytesIO(content_bytes))
            text_pages = []
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_pages.append(page_text.strip())
            extracted_text = "\n\n".join(text_pages)
            if not extracted_text.strip():
                extracted_text = f"[PDF Document: {filename} - No extractable text found]"
            return extracted_text, "pdf"

        elif extension == "docx":
            import docx
            doc = docx.Document(io.BytesIO(content_bytes))
            paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
            extracted_text = "\n\n".join(paragraphs)
            if not extracted_text.strip():
                extracted_text = f"[DOCX Document: {filename} - No text paragraphs found]"
            return extracted_text, "docx"

        elif extension in ["txt", "md"]:
            try:
                extracted_text = content_bytes.decode("utf-8")
            except UnicodeDecodeError:
                extracted_text = content_bytes.decode("latin-1", errors="replace")
            return extracted_text.strip(), extension

        else:
            raise HTTPException(status_code=400, detail="Unsupported file format.")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse document '{filename}': {str(e)}")
