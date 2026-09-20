import json
import logging
import re
from typing import Type, TypeVar, Optional, Dict, Any
from pydantic import BaseModel
from app.core.config import settings

logger = logging.getLogger("edupath.llm_service")

T = TypeVar("T", bound=BaseModel)

class LLMService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL
        self._client = None

        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
                logger.info(f"Gemini Client initialized with model {self.model}")
            except Exception as e:
                logger.warning(f"Failed to initialize google-genai client: {e}")

    def is_configured(self) -> bool:
        return bool(self.api_key and self._client is not None)

    def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if not self.is_configured():
            return ""

        try:
            config = {}
            if system_instruction:
                config["system_instruction"] = system_instruction

            response = self._client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=config if config else None,
            )
            return response.text or ""
        except Exception as e:
            err_msg = str(e)
            if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "Quota" in err_msg:
                logger.warning(
                    f"Gemini free-tier rate limit reached for {self.model} (5 RPM limit). "
                    "Gracefully activating fallback response."
                )
            else:
                logger.error(f"Gemini API error during generate_text: {e}")
            raise e

    def generate_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_instruction: Optional[str] = None,
        max_retries: int = 1,
    ) -> Optional[T]:
        if not self.is_configured():
            return None

        schema_json = json.dumps(response_model.model_json_schema(), indent=2)
        augmented_prompt = f"""{prompt}

CRITICAL: Return strictly valid JSON that conforms to this JSON Schema:
```json
{schema_json}
```
Do not include any conversational text or markdown formatting other than raw JSON or ```json ``` block."""

        for attempt in range(max_retries + 1):
            try:
                raw_text = self.generate_text(augmented_prompt, system_instruction)
                if not raw_text:
                    return None

                # Clean markdown blocks if present
                clean_json_str = raw_text.strip()
                match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", clean_json_str)
                if match:
                    clean_json_str = match.group(1).strip()

                parsed_data = json.loads(clean_json_str)
                validated_model = response_model.model_validate(parsed_data)
                return validated_model
            except Exception as err:
                err_msg = str(err)
                # If 429 rate limit, do NOT hammer retries; immediately return None for fast fallback
                if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "Quota" in err_msg:
                    logger.info("429 Rate Limit active: skipping retries and using deterministic fallback.")
                    return None

                logger.warning(f"Structured validation attempt {attempt + 1} failed: {err}")
                if attempt == max_retries:
                    return None

        return None

llm_service = LLMService()
