from app.schemas.recommendation.requests import GenerateRecommendationsRequest


def create_recommendation_prompt(trip_data: GenerateRecommendationsRequest) -> str:
    duration = (trip_data.end_date - trip_data.start_date).days + 1

    users = "\n".join(
        (
            f"- {user.name} ({user.age}, {user.gender}) from {user.from_city}, {user.from_country}\n"
            f"  Bio: {user.bio}\n"
            f"  Languages: {', '.join(user.languages)}\n"
            f"  Interests: {', '.join(user.interests)}\n"
            f"  Travel Style: {', '.join(user.travel_styles)}"
        )
        for user in trip_data.users
    )

    interests = sorted(
        {interest for user in trip_data.users for interest in user.interests}
    )
    styles = sorted(
        {style for user in trip_data.users for style in user.travel_styles}
    )

    return (
        f"You are an expert travel recommendation AI.\n"
        f"Recommend 20-30 real places in {trip_data.destination_city}, {trip_data.destination_country}.\n\n"
        f"Trip: {trip_data.start_date} to {trip_data.end_date} ({duration} days)\n"
        f"Budget: ${trip_data.min_budget:,.0f} - ${trip_data.max_budget:,.0f}\n"
        f"Description: {trip_data.description}\n\n"
        f"Travelers:\n{users}\n\n"
        f"Rules:\n"
        f"1. Match interests: {', '.join(interests)}\n"
        f"2. Match travel style: {', '.join(styles)}\n"
        f"3. Use real places with accurate details.\n"
        f"4. For every place include audience using only: kids, teens, adults, seniors, family, couples, friends, solo_travelers.\n"
        f"5. Return JSON only.\n"
        f"6. query_to_search: a clear search term for Unsplash image API for each place.\n"
    )
