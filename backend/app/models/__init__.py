# Locations
from app.models.locations import Country, City, Nationality

# Users & Profiles
from app.models.users import User
from app.models.profiles import Profile

# Preferences (junction tables)
from app.models.preferences import (
    Interest, UserInterest,
    Language, UserLanguage,
    TravelStyle, UserTravelStyle,
)

# Trips
from app.models.trips import TripVacancy, Offer, OfferStatus

# Chat
from app.models.chat import ChatGroup, ChatMember, Message

# Recommendation
from app.models.recommendation import GeneratedTripPlan, RecommendedPlace
