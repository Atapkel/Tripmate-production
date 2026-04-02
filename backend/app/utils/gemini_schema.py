def build_response_schema() -> dict:
    """Build the JSON schema that tells Gemini to return structured output."""
    return {
        "type": "OBJECT",
        "properties": {
            "recommended_places": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "place_id": {"type": "STRING"},
                        "name": {"type": "STRING"},
                        "category": {
                            "type": "STRING",
                            "enum": [
                                "landmark", "restaurant", "museum", "nature",
                                "sports", "cultural", "shopping", "activity", "wellness",
                            ],
                        },
                        "short_description": {"type": "STRING"},
                        "why_people_go": {"type": "STRING"},
                        "why_recommended": {"type": "STRING"},
                        "best_time_of_day": {
                            "type": "STRING",
                            "enum": ["morning", "afternoon", "evening", "sunset", "night"],
                        },
                        "best_season": {
                            "type": "ARRAY",
                            "items": {
                                "type": "STRING",
                                "enum": ["spring", "summer", "autumn", "winter"],
                            },
                        },
                        "audience": {
                            "type": "ARRAY",
                            "items": {
                                "type": "STRING",
                                "enum": [
                                    "kids", "teens", "adults", "seniors",
                                    "family", "couples", "friends", "solo_travelers",
                                ],
                            },
                        },
                        "image_url": {"type": "STRING"},
                        "query_to_search": {"type": "STRING"},
                    },
                    "required": [
                        "place_id", "name", "category", "short_description",
                        "why_people_go", "why_recommended", "best_time_of_day",
                        "best_season", "audience", "image_url",
                    ],
                },
            },
        },
        "required": ["recommended_places"],
    }
