import asyncio
import logging
from typing import Optional

import httpx
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import config
from app.models.recommendation.recommended_places import RecommendedPlace

logger = logging.getLogger(__name__)

UNSPLASH_API_BASE = "https://api.unsplash.com"


async def _fetch_unsplash_photo(
    client: httpx.AsyncClient, query: str
) -> Optional[str]:
    try:
        response = await client.get(
            f"{UNSPLASH_API_BASE}/search/photos",
            params={"query": query, "per_page": 1},
            headers={"Authorization": f"Client-ID {config.UNSPLASH_ACCESS_KEY}"},
            timeout=10.0,
        )
        response.raise_for_status()

        results = response.json().get("results", [])
        if not results:
            logger.warning("[Unsplash] No results for query: %r", query)
            return None

        image_url = results[0]["urls"]["regular"]
        logger.info("[Unsplash] Found image for %r", query)
        return image_url

    except httpx.HTTPStatusError as exc:
        logger.error(
            "[Unsplash] HTTP %s for query %r", exc.response.status_code, query
        )
    except httpx.RequestError as exc:
        logger.error("[Unsplash] Request error for query %r: %s", query, exc)
    except (KeyError, IndexError) as exc:
        logger.error("[Unsplash] Unexpected response for query %r: %s", query, exc)

    return None


async def enrich_with_unsplash_images(places: list[RecommendedPlace]) -> None:
    """Fetch Unsplash images concurrently and update places in-memory."""
    if not places:
        return

    logger.info("[Unsplash] Enriching %d place(s)...", len(places))

    async with httpx.AsyncClient() as client:
        async def _enrich_one(place: RecommendedPlace) -> None:
            query = place.query_to_search or place.name
            url = await _fetch_unsplash_photo(client, query)
            if url:
                place.image_url = url

        await asyncio.gather(*[_enrich_one(p) for p in places])

    logger.info("[Unsplash] Done.")


async def enrich_db_places_with_unsplash(
    db: AsyncSession, db_places: list[RecommendedPlace]
) -> None:
    """Fetch Unsplash images and persist to DB. Caller must commit."""
    if not db_places:
        return

    logger.info("[Unsplash] Enriching %d DB place(s)...", len(db_places))

    async with httpx.AsyncClient() as client:
        async def _enrich_one(place: RecommendedPlace) -> None:
            query = place.query_to_search or place.name
            url = await _fetch_unsplash_photo(client, query)
            if url:
                place.image_url = url
                await db.execute(
                    update(RecommendedPlace)
                    .where(RecommendedPlace.id == place.id)
                    .values(image_url=url)
                )

        await asyncio.gather(*[_enrich_one(p) for p in db_places])

    logger.info("[Unsplash] Done.")
