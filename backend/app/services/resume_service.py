import os
import uuid
import logging
from typing import Optional
from fastapi import UploadFile, HTTPException

logger = logging.getLogger("edupath.resume_service")

class ResumeService:
    ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".doc"}
    MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

    def extract_text_from_pdf(self, file_path: str) -> str:
        text = ""
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception as e:
            logger.error(f"Error extracting text from PDF {file_path}: {e}")
        return text.strip()

    def extract_text_from_docx(self, file_path: str) -> str:
        text = ""
        try:
            import docx
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                if para.text:
                    text += para.text + "\n"
        except Exception as e:
            logger.error(f"Error extracting text from DOCX {file_path}: {e}")
        return text.strip()

    async def save_and_extract_resume(self, file: UploadFile, upload_dir: str) -> tuple[str, str, int]:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(self.ALLOWED_EXTENSIONS)}",
            )

        unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, unique_filename)

        content = await file.read()
        size_bytes = len(content)
        if size_bytes > self.MAX_FILE_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="File exceeds 10MB limit.")

        with open(file_path, "wb") as f:
            f.write(content)

        extracted_text = ""
        if ext == ".pdf":
            extracted_text = self.extract_text_from_pdf(file_path)
        elif ext in {".docx", ".doc"}:
            extracted_text = self.extract_text_from_docx(file_path)
        elif ext == ".txt":
            try:
                extracted_text = content.decode("utf-8", errors="ignore")
            except Exception:
                extracted_text = ""

        return file_path, extracted_text, size_bytes

resume_service = ResumeService()
