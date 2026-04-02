import json
import logging

from fastapi import HTTPException, status
from pydantic import ValidationError as PydanticValidationError

from app.schemas.recommendation.structured import PlaceRecommendationsSchema

logger = logging.getLogger(__name__)


def strip_json_fences(text: str) -> str:
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        return "\n".join(lines).strip()
    return text


def validate_recommendations(raw_text: str) -> PlaceRecommendationsSchema:
    cleaned = strip_json_fences(raw_text)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini did not return valid JSON",
        ) from exc

    try:
        return PlaceRecommendationsSchema.model_validate(parsed)
    except PydanticValidationError as exc:
        logger.warning("Gemini response failed schema validation: %s", exc.errors())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini response does not match the expected schema",
        ) from exc
