# services/wikipedia_service.py
from urllib.parse import quote

import httpx

_WIKI_SUMMARY_BASE = "https://en.wikipedia.org/api/rest_v1/page/summary"


class WikipediaService:
    _cache: dict[str, dict] = {}

    async def _fetch_wiki_summary(self, title: str) -> dict | None:
        if not title or not str(title).strip():
            return None
        wiki_title = str(title).strip().replace(" ", "_")
        encoded = quote(wiki_title, safe="")
        url = f"{_WIKI_SUMMARY_BASE}/{encoded}"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(
                    url,
                    headers={
                        "Accept": "application/json",
                        "User-Agent": "Tripmate/1.0 (https://github.com/)",
                    },
                )
                if resp.status_code != 200:
                    return None
                data = resp.json()
        except (httpx.HTTPError, ValueError, KeyError):
            return None

        extract = data.get("extract")
        thumb = data.get("originalimage") or {}
        photo_url = thumb.get("source")
        content_urls = data.get("content_urls") or {}
        desktop = content_urls.get("desktop") or {}
        wiki_url = desktop.get("page")

        return {
            "description": extract,
            "photo_url": photo_url,
            "wiki_url": wiki_url,
        }

    async def get_city_info(self, city_name: str, country_name: str) -> dict:
        cache_key = f"{city_name}:{country_name}".lower()

        if cache_key in self._cache:
            return self._cache[cache_key]

        result = await self._fetch_wiki_summary(f"{city_name}, {country_name}")

        if not result:
            result = await self._fetch_wiki_summary(city_name)

        if not result:
            result = {
                "description": None,
                "photo_url": None,
                "wiki_url": None,
            }

        self._cache[cache_key] = result
        return result
