"""
Populate database with initial seed data.

Adds default languages, interests, travel styles, countries, and cities.
Idempotent — skips tables that already have data.

Usage:
    python populate_db.py
"""

import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.locations import City, Country
from app.models.preferences import Interest, Language, TravelStyle


async def populate_languages():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Language))
        if result.scalars().first():
            print("Languages already populated. Skipping...")
            return

        languages = [
            "Kazakh", "English", "Russian", "Turkish", "Arabic",
            "Chinese", "French", "German", "Spanish", "Japanese",
        ]

        for name in languages:
            session.add(Language(name=name))

        await session.commit()
        print(f"Added {len(languages)} languages")


async def populate_interests():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Interest))
        if result.scalars().first():
            print("Interests already populated. Skipping...")
            return

        interests = [
            "Food & Dining", "Adventure & Sports", "Culture & History",
            "Nature & Outdoors", "Arts & Entertainment", "Shopping",
            "Wellness & Relaxation", "Photography", "Nightlife",
            "Local Experiences",
        ]

        for name in interests:
            session.add(Interest(name=name))

        await session.commit()
        print(f"Added {len(interests)} interests")


async def populate_travel_styles():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(TravelStyle))
        if result.scalars().first():
            print("Travel styles already populated. Skipping...")
            return

        styles = [
            "Luxury", "Budget-Friendly", "Adventure",
            "Cultural Immersion", "Relaxation",
        ]

        for name in styles:
            session.add(TravelStyle(name=name))

        await session.commit()
        print(f"Added {len(styles)} travel styles")


async def populate_countries_and_cities():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Country))
        if result.scalars().first():
            print("Countries already populated. Skipping...")
            return

        countries_with_cities = {
            "Kazakhstan": ["Qulsary", "Kyzylorda", "Almaty", "Astana", "Shymkent", "Aktobe", "Karaganda", "Atyrau", "Mangystau"],
            "Turkey": ["Istanbul", "Ankara", "Antalya", "Izmir", "Bodrum", "Cappadocia", "Trabzon"],
            "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman"],
            "United States": ["New York", "Los Angeles", "San Francisco", "Miami", "Las Vegas", "Chicago", "Houston"],
            "United Kingdom": ["London", "Manchester", "Edinburgh", "Birmingham", "Liverpool"],
            "France": ["Paris", "Nice", "Lyon", "Marseille", "Bordeaux"],
            "Germany": ["Berlin", "Munich", "Frankfurt", "Hamburg", "Cologne"],
            "Italy": ["Rome", "Milan", "Venice", "Florence", "Naples"],
            "Spain": ["Madrid", "Barcelona", "Seville", "Valencia", "Malaga"],
            "Japan": ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Sapporo"],
            "South Korea": ["Seoul", "Busan", "Jeju", "Incheon"],
            "China": ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu"],
            "Thailand": ["Bangkok", "Phuket", "Chiang Mai", "Pattaya"],
            "Indonesia": ["Jakarta", "Bali", "Yogyakarta", "Surabaya"],
            "Malaysia": ["Kuala Lumpur", "Penang", "Langkawi", "Johor Bahru"],
            "Singapore": ["Singapore"],
            "Russia": ["Moscow", "Saint Petersburg", "Kazan", "Sochi", "Novosibirsk"],
            "Georgia": ["Tbilisi", "Batumi", "Kutaisi"],
            "Uzbekistan": ["Tashkent", "Samarkand", "Bukhara", "Khiva"],
            "Kyrgyzstan": ["Bishkek", "Osh", "Issyk-Kul"],
            "Egypt": ["Cairo", "Hurghada", "Sharm El Sheikh", "Luxor", "Alexandria"],
            "Mexico": ["Mexico City", "Cancun", "Playa del Carmen", "Guadalajara"],
            "Brazil": ["Rio de Janeiro", "Sao Paulo", "Salvador", "Brasilia"],
            "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth"],
            "Canada": ["Toronto", "Vancouver", "Montreal", "Ottawa"],
            "India": ["Delhi", "Mumbai", "Goa", "Bangalore", "Jaipur"],
            "Greece": ["Athens", "Santorini", "Mykonos", "Thessaloniki", "Crete"],
            "Portugal": ["Lisbon", "Porto", "Faro", "Madeira"],
            "Netherlands": ["Amsterdam", "Rotterdam", "The Hague", "Utrecht"],
            "Czech Republic": ["Prague", "Brno", "Karlovy Vary"],
            "Austria": ["Vienna", "Salzburg", "Innsbruck"],
            "Switzerland": ["Zurich", "Geneva", "Bern", "Lucerne"],
            "Poland": ["Warsaw", "Krakow", "Gdansk", "Wroclaw"],
            "Hungary": ["Budapest", "Debrecen"],
            "Croatia": ["Zagreb", "Dubrovnik", "Split"],
            "Montenegro": ["Podgorica", "Budva", "Kotor"],
            "Maldives": ["Male"],
            "Sri Lanka": ["Colombo", "Kandy", "Galle"],
            "Vietnam": ["Hanoi", "Ho Chi Minh City", "Da Nang"],
            "Philippines": ["Manila", "Cebu", "Boracay", "Palawan"],
            "Morocco": ["Marrakech", "Casablanca", "Fes", "Tangier"],
            "South Africa": ["Cape Town", "Johannesburg", "Durban"],
            "Tanzania": ["Dar es Salaam", "Zanzibar", "Arusha"],
            "Kenya": ["Nairobi", "Mombasa"],
            "Argentina": ["Buenos Aires", "Mendoza", "Bariloche"],
            "Colombia": ["Bogota", "Medellin", "Cartagena"],
            "Peru": ["Lima", "Cusco", "Arequipa"],
            "Chile": ["Santiago", "Valparaiso"],
            "New Zealand": ["Auckland", "Wellington", "Queenstown"],
            "Norway": ["Oslo", "Bergen", "Tromso"],
            "Sweden": ["Stockholm", "Gothenburg", "Malmo"],
            "Finland": ["Helsinki", "Rovaniemi", "Turku"],
            "Denmark": ["Copenhagen", "Aarhus"],
            "Iceland": ["Reykjavik"],
            "Ireland": ["Dublin", "Cork", "Galway"],
            "Scotland": ["Edinburgh", "Glasgow"],
            "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina"],
            "Qatar": ["Doha"],
            "Oman": ["Muscat"],
            "Bahrain": ["Manama"],
            "Jordan": ["Amman", "Petra", "Aqaba"],
            "Israel": ["Tel Aviv", "Jerusalem", "Haifa"],
            "Azerbaijan": ["Baku"],
            "Armenia": ["Yerevan"],
        }

        total_cities = 0
        for country_name, city_names in countries_with_cities.items():
            country = Country(name=country_name)
            session.add(country)
            await session.flush()

            for city_name in city_names:
                session.add(City(name=city_name, country_id=country.id))
                total_cities += 1

        await session.commit()
        print(f"Added {len(countries_with_cities)} countries and {total_cities} cities")


async def main():
    print("Populating database with initial data...")
    print("-" * 50)

    await populate_countries_and_cities()
    await populate_languages()
    await populate_interests()
    await populate_travel_styles()

    print("-" * 50)
    print("Database population complete!")


if __name__ == "__main__":
    asyncio.run(main())
