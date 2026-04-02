import logging

import httpx
from fastapi import HTTPException, status

from app.core.config import config
from app.schemas.recommendation.requests import GenerateRecommendationsRequest
from app.schemas.recommendation.structured import PlaceRecommendationsSchema
from app.utils.gemini_schema import build_response_schema
from app.utils.json_helpers import validate_recommendations
from app.utils.prompt_builder import create_recommendation_prompt

logger = logging.getLogger(__name__)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


async def generate_recommendations(
    trip_data: GenerateRecommendationsRequest,
) -> PlaceRecommendationsSchema:
    if not config.GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY is not configured",
        )

    url = GEMINI_API_URL.format(model=config.GEMINI_MODEL)
    prompt = create_recommendation_prompt(trip_data)

    request_body = {
        "contents": [
            {
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": build_response_schema(),
        },
    }

    logger.info("Sending request to Gemini model: %s", config.GEMINI_MODEL)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                params={"key": config.GEMINI_API_KEY},
                json=request_body,
                timeout=config.GEMINI_TIMEOUT_SECONDS,
            )
    except httpx.TimeoutException as e:
        logger.error("Gemini API request timed out: %s", e)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Gemini API request timed out",
        ) from e
    except httpx.RequestError as e:
        logger.error("Error calling Gemini API: %s", e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Error while calling Gemini API",
        ) from e

    if response.status_code != 200:
        logger.error(
            "Gemini API returned %s: %s", response.status_code, response.text
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini API error: {response.status_code}",
        )

    data = response.json()

    candidates = data.get("candidates", [])
    if not candidates:
        logger.warning("Gemini returned no candidates")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini returned no candidates",
        )

    parts = candidates[0].get("content", {}).get("parts", [])
    if not parts:
        logger.warning("Gemini returned empty parts")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini returned an empty response",
        )

    raw_text = parts[0].get("text", "").strip()
    if not raw_text:
        logger.warning("Gemini returned an empty text")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini returned an empty response",
        )

    return validate_recommendations(raw_text)
