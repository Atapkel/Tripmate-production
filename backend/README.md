# TripMate

## What is TripMate?

TripMate is a platform where people find travel companions. The core problem it solves: you want to travel somewhere but don't have anyone to go with. Instead of going alone or not going at all, you post your trip on TripMate and find someone who wants to go to the same place at the same time.

## How It Works

### 1. Sign Up and Build Your Profile

A new user registers with email and password. We send a verification code to their email to confirm it's real. After verifying, the user creates a profile with:

- **Personal info** — name, age, gender, bio, city they live in
- **Profile photo** — uploaded directly to the platform
- **Languages** they speak (Kazakh, English, Russian, etc.)
- **Interests** — what they enjoy (Food & Dining, Adventure & Sports, Culture & History, Photography, Nightlife, etc.)
- **Travel style** — how they like to travel (Luxury, Budget-Friendly, Adventure, Cultural Immersion, Relaxation)

This profile is public. When someone is deciding whether to travel with you, they look at your profile to see if you're a good match.

### 2. Create a Trip Vacancy

When a user wants to travel, they create a **trip vacancy** — think of it like a job posting, but for a travel buddy. A trip vacancy includes:

- **Where** — destination country and city (e.g., Turkey, Istanbul)
- **Where from** — departure country and city
- **When** — start and end dates
- **Budget** — expected budget for the trip
- **Age range** — preferred age range of companion (e.g., 20-30)
- **Gender preference** — male, female, or any
- **Description** — free text explaining the trip plans, vibe, expectations

Trip vacancies are visible to everyone. Anyone can browse and filter them by destination, dates, budget, age range, and gender preference.

### 3. Send an Offer

When a user finds a trip they want to join, they send an **offer** to the trip creator. The offer includes a message explaining why they want to join. The trip creator can then:

- **Accept** the offer — the offerer joins the trip
- **Reject** the offer — the offerer is declined
- The offerer can also **cancel** their own offer while it's still pending

### 4. Chat Together

The moment a trip creator **accepts** an offer, a **chat group** is automatically created for that trip. Both users are added as members. This is where they coordinate the details — flights, accommodation, meeting points, itinerary.

The chat supports:
- **Real-time messaging** via WebSocket (messages appear instantly, no page refresh)
- **Typing indicators** (you see when the other person is typing)
- **Online status** (see who's currently in the chat)
- Regular REST messaging as a fallback

### 5. AI Trip Plan

Once a trip has members, anyone in the trip can ask the AI to **generate a trip plan**. The AI (Google Gemini) analyzes:

- The trip destination and dates
- All members' profiles, interests, and travel styles
- Budget constraints

It then generates a list of **recommended places** to visit, each with:
- Name, description, and category (restaurant, museum, park, etc.)
- Why this place matches the group's interests
- Estimated cost
- A photo from Unsplash

The plan is saved and can be viewed anytime by trip members.

---

## User Roles and Permissions

There are two perspectives in every trip interaction:

| Role | What they can do |
|------|-----------------|
| **Trip Creator** | Creates the trip vacancy. Reviews incoming offers. Accepts or rejects them. Can update or delete the trip. Can generate AI plans. |
| **Offerer / Joiner** | Browses trips. Sends offers to join. Can cancel pending offers. Once accepted, becomes a trip member with chat access and plan access. |

Both roles have equal access to the chat and trip plan after an offer is accepted.

---

## Key Screens (for designers/frontend)

### Unauthenticated
1. **Registration** — email, password, role
2. **Email verification** — enter the 6-digit code
3. **Login** — email + password
4. **Forgot password** — enter email, receive code, set new password

### Profile Setup
5. **Create profile** — name, age, gender, bio, city selection (country -> city dropdown)
6. **Profile photo upload** — crop/upload an image
7. **Preferences** — pick languages, interests, and travel styles from predefined lists (multi-select)
8. **View profile** — public profile page showing all info, photo, preferences

### Trip Discovery
9. **Trip feed / search** — browse all trip vacancies with filters (destination, dates, budget, age, gender, departure city)
10. **Trip detail** — full trip info + creator's profile preview + "Send Offer" button
11. **My trips** — list of trips the user created

### Offers
12. **Send offer** — write a message to the trip creator
13. **My offers** — list of offers the user has sent (with status: pending/accepted/rejected/cancelled)
14. **Incoming offers** (for trip creator) — list of offers on their trip, with accept/reject actions. Each offer shows the offerer's profile preview

### Chat
15. **Chat list** — all chat groups the user is a member of
16. **Chat room** — real-time messaging with the trip companion. Shows messages, typing indicator, online members
17. **Chat members** — see who's in the group

### AI Trip Plan
18. **Generate plan** — button to request AI recommendations
19. **View plan** — list of recommended places with photos, descriptions, costs, and why they match the group

### Settings
20. **Edit profile** — update any profile field
21. **Change password** — requires current password
22. **Delete profile**

---

## Data that Comes Pre-loaded

The database is seeded with default data on first launch. No one needs to add this manually:

- **60 countries** with **230+ cities** (Kazakhstan, Turkey, UAE, USA, UK, France, Germany, Italy, Spain, Japan, South Korea, Thailand, etc.)
- **10 languages** (Kazakh, English, Russian, Turkish, Arabic, Chinese, French, German, Spanish, Japanese)
- **10 interests** (Food & Dining, Adventure & Sports, Culture & History, Nature & Outdoors, Arts & Entertainment, Shopping, Wellness & Relaxation, Photography, Nightlife, Local Experiences)
- **5 travel styles** (Luxury, Budget-Friendly, Adventure, Cultural Immersion, Relaxation)

These are used in dropdowns and multi-selects throughout the app.

---

## Example User Flow

> **Aidar** lives in Almaty and wants to visit Istanbul in July. He creates a trip vacancy:
> - Destination: Turkey, Istanbul
> - From: Kazakhstan, Almaty
> - Dates: July 10 - July 20
> - Budget: $1500
> - Age: 22-30
> - Gender: any
> - Description: "Looking for a chill travel buddy to explore Istanbul. Planning to visit the Grand Bazaar, try street food, and take a Bosphorus cruise."
>
> **Dana** from Astana sees Aidar's trip in the feed. She checks his profile — he speaks Kazakh and English, likes Food & Dining and Culture & History, travels Budget-Friendly. Looks like a good match. She sends an offer: "Hey! I'm also planning Istanbul around those dates. I love food tours and historical places, would be great to explore together!"
>
> Aidar reviews Dana's offer, checks her profile, and accepts it.
>
> A chat group is created instantly. They start coordinating — Aidar found cheap flights, Dana knows a good hostel in Sultanahmet.
>
> Dana taps "Generate Trip Plan." The AI looks at both their interests (food, culture, budget-friendly) and generates a list: Grand Bazaar, Hagia Sophia, street food tour in Kadikoy, Bosphorus ferry, Topkapi Palace — each with photos, descriptions, and estimated costs.

---

## Tech Details (for developers)

### Stack
- **Backend:** FastAPI, Python 3.12
- **Database:** PostgreSQL
- **Cache/Sessions:** Redis
- **AI:** Google Gemini API
- **Photos:** Unsplash API
- **Auth:** JWT tokens (access + refresh) with email verification via SMTP
- **Deployment:** Docker + Docker Compose

### Running Locally

```bash
cp .env.example .env   # fill in API keys and SMTP credentials
docker compose up -d --build
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Project Structure

```
app/
├── api/            Route handlers (one file per feature)
├── core/           Config, database, security, Redis, WebSocket manager
├── models/         Database models
├── schemas/        Request/response validation
├── services/       Business logic
├── repositories/   Database queries
└── utils/          Helpers (AI prompt builder, JSON parsing)
```

---

## API Reference

Base URL: `/api/v1`

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register with email + password. Sends verification code |
| POST | `/auth/login` | Log in. Returns access + refresh tokens |
| POST | `/auth/logout` | Invalidate current token |
| POST | `/auth/refresh` | Get new access token using refresh token |
| GET | `/auth/me` | Get current user info |
| POST | `/auth/verify-email` | Submit email verification code |
| POST | `/auth/resend-verification` | Resend verification code |
| POST | `/auth/forgot-password` | Request password reset code |
| POST | `/auth/reset-password` | Reset password with code |
| POST | `/auth/change-password` | Change password (authenticated) |

### Profiles

| Method | Path | Description |
|--------|------|-------------|
| POST | `/profiles` | Create profile |
| GET | `/profiles/me` | Get my profile with preferences |
| GET | `/profiles/{id}` | Get any profile (public) |
| PUT | `/profiles/me` | Update my profile |
| DELETE | `/profiles/me` | Delete my profile |
| POST | `/profiles/me/photo` | Upload profile photo |
| DELETE | `/profiles/me/photo` | Remove profile photo |

### Profile Preferences

| Method | Path | Description |
|--------|------|-------------|
| POST | `/profiles/me/languages` | Add a language |
| DELETE | `/profiles/me/languages/{id}` | Remove a language |
| PUT | `/profiles/me/languages` | Set all languages at once |
| POST | `/profiles/me/interests` | Add an interest |
| DELETE | `/profiles/me/interests/{id}` | Remove an interest |
| PUT | `/profiles/me/interests` | Set all interests at once |
| POST | `/profiles/me/travel-styles` | Add a travel style |
| DELETE | `/profiles/me/travel-styles/{id}` | Remove a travel style |
| PUT | `/profiles/me/travel-styles` | Set all travel styles at once |

### Lookup Options (public, no auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/options/countries` | All countries |
| GET | `/options/countries/{id}/cities` | Cities in a country |
| GET | `/options/languages` | All languages |
| GET | `/options/interests` | All interests |
| GET | `/options/travel-styles` | All travel styles |

### Trips

| Method | Path | Description |
|--------|------|-------------|
| POST | `/trips` | Create a trip vacancy |
| GET | `/trips` | Browse all trips (with filters) |
| GET | `/trips/me` | My trips |
| GET | `/trips/{id}` | Get trip details |
| PUT | `/trips/{id}` | Update trip (creator only) |
| PATCH | `/trips/{id}/status` | Change trip status (creator only) |
| DELETE | `/trips/{id}` | Delete trip (creator only) |
| POST | `/trips/{id}/generate-plan` | Generate AI trip plan |
| GET | `/trips/{id}/plan` | View saved trip plan |

### Offers

| Method | Path | Description |
|--------|------|-------------|
| POST | `/offers` | Send offer to join a trip |
| GET | `/offers/me` | My sent offers |
| GET | `/offers/trip/{trip_id}` | Offers on a trip (creator only) |
| GET | `/offers/{id}` | Get offer details |
| PATCH | `/offers/{id}` | Update offer message |
| PATCH | `/offers/{id}/status` | Accept/reject offer (creator only) |
| POST | `/offers/{id}/cancel` | Cancel my offer |
| DELETE | `/offers/{id}` | Delete my offer |

### Chats

| Method | Path | Description |
|--------|------|-------------|
| GET | `/chats/me` | My chat groups |
| GET | `/chats/{id}` | Get chat group |
| GET | `/chats/trip/{trip_id}` | Get chat for a trip |
| GET | `/chats/{id}/members` | Chat members |
| POST | `/chats/{id}/messages` | Send message (REST) |
| GET | `/chats/{id}/messages` | Get messages (paginated) |
| GET | `/chats/{id}/messages/recent` | Get latest messages |
| DELETE | `/chats/{id}/messages/{msg_id}` | Delete message |
| GET | `/chats/{id}/active-users` | Online users in chat |
| WS | `/chats/ws/{id}?token=` | Real-time WebSocket chat |
