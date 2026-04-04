import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ROUTES } from "@/lib/constants";
import {
  MapPin,
  Search,
  Users,
  MessageCircle,
  Sparkles,
  Globe,
  Shield,
  ArrowRight,
  ChevronRight,
  Plane,
  Heart,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Find Travel Companions",
    description:
      "Browse trip vacancies from travelers worldwide. Filter by destination, dates, budget, and travel style to find your perfect match.",
  },
  {
    icon: Users,
    title: "Build Your Travel Profile",
    description:
      "Showcase your interests, languages, and travel style. Let others know what kind of traveler you are.",
  },
  {
    icon: MessageCircle,
    title: "Real-Time Chat",
    description:
      "Once matched, coordinate every detail with your travel buddy through instant messaging.",
  },
  {
    icon: Sparkles,
    title: "AI Trip Planning",
    description:
      "Get personalized itineraries powered by AI that consider everyone's interests, budget, and travel preferences.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description: "Sign up and tell us about your travel preferences, languages, and interests.",
  },
  {
    number: "02",
    title: "Post or Browse Trips",
    description: "Create a trip vacancy or browse existing ones to find the adventure that calls you.",
  },
  {
    number: "03",
    title: "Connect & Plan",
    description: "Send an offer, get matched, and start planning together with AI-powered recommendations.",
  },
];

const stats = [
  { value: "60+", label: "Countries" },
  { value: "230+", label: "Cities" },
  { value: "10", label: "Languages" },
  { value: "AI", label: "Trip Planning" },
];

const destinations = [
  { city: "Istanbul", country: "Turkey", emoji: "🇹🇷" },
  { city: "Tokyo", country: "Japan", emoji: "🇯🇵" },
  { city: "Barcelona", country: "Spain", emoji: "🇪🇸" },
  { city: "Dubai", country: "UAE", emoji: "🇦🇪" },
  { city: "Bali", country: "Indonesia", emoji: "🇮🇩" },
  { city: "Paris", country: "France", emoji: "🇫🇷" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "TripMate",
  description:
    "Find your perfect travel companion. Connect with like-minded travelers, plan trips together with AI, and create unforgettable memories.",
  applicationCategory: "TravelApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-surface font-body">
      <Helmet>
        <title>TripMate — Find Your Travel Companion</title>
        <meta
          name="description"
          content="Don't travel alone. Connect with like-minded travelers, plan trips together with AI, and create unforgettable memories. Browse 230+ cities across 60+ countries."
        />
        <meta
          name="keywords"
          content="travel companion, travel buddy, find travel partner, trip planning, AI travel planner, group travel, solo travel"
        />
        <link rel="canonical" href="https://tripmate.live" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="TripMate — Find Your Travel Companion"
        />
        <meta
          property="og:description"
          content="Don't travel alone. Connect with like-minded travelers, plan trips together with AI, and create unforgettable memories."
        />
        <meta property="og:url" content="https://tripmate.live" />
        <meta property="og:image" content="https://tripmate.live/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-600 text-white shadow-glow">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-xl font-heading font-bold text-text-primary">
                TripMate
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={ROUTES.LOGIN}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Log in
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors shadow-glow"
              >
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-surface to-accent-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium mb-6">
              <Plane className="w-4 h-4" />
              <span>Travel is better together</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-text-primary leading-tight tracking-tight">
              Find your perfect{" "}
              <span className="text-primary-600">travel companion</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Don't travel alone. Connect with like-minded travelers, plan trips
              together, and create unforgettable memories with people who share
              your adventure spirit.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={ROUTES.REGISTER}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-2xl transition-all shadow-elevated hover:shadow-modal hover:-translate-y-0.5"
              >
                Get started for free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={ROUTES.LOGIN}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-text-primary bg-surface border border-border hover:border-border-strong rounded-2xl transition-all hover:shadow-card"
              >
                I already have an account
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 rounded-2xl bg-surface/80 border border-border backdrop-blur-sm"
              >
                <div className="text-2xl sm:text-3xl font-heading font-bold text-primary-600">
                  {stat.value}
                </div>
                <div className="text-sm text-text-secondary mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations Ticker */}
      <section className="py-12 bg-surface-tertiary border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-text-tertiary font-medium uppercase tracking-wider mb-6">
            Popular destinations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {destinations.map((dest) => (
              <div
                key={dest.city}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-sm text-text-secondary hover:border-primary-300 hover:text-primary-600 transition-colors"
              >
                <span>{dest.emoji}</span>
                <span className="font-medium">{dest.city}</span>
                <span className="text-text-tertiary">·</span>
                <span className="text-text-tertiary">{dest.country}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary">
              Everything you need to travel together
            </h2>
            <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
              From finding the right companion to planning the perfect trip, we've got you covered.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 sm:p-8 rounded-3xl bg-surface border border-border hover:border-primary-200 hover:shadow-elevated transition-all"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="mt-5 text-xl font-heading font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-surface-tertiary to-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary">
              How it works
            </h2>
            <p className="mt-4 text-lg text-text-secondary max-w-xl mx-auto">
              Three simple steps to your next adventure
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, idx) => (
              <div key={step.number} className="relative text-center">
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-primary-200" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white text-xl font-heading font-bold shadow-glow mb-5">
                  {step.number}
                </div>
                <h3 className="text-lg font-heading font-semibold text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why TripMate */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary">
                Why travelers choose TripMate
              </h2>
              <p className="mt-4 text-lg text-text-secondary leading-relaxed">
                Solo travel can be amazing, but sometimes the best memories are
                made with others. TripMate bridges the gap.
              </p>

              <div className="mt-8 space-y-5">
                {[
                  {
                    icon: Globe,
                    title: "Global Community",
                    desc: "Connect with travelers from 60+ countries speaking 10+ languages.",
                  },
                  {
                    icon: Shield,
                    title: "Verified Profiles",
                    desc: "Email-verified accounts with detailed profiles you can review before connecting.",
                  },
                  {
                    icon: Heart,
                    title: "Smart Matching",
                    desc: "Filter by age, interests, travel style, and budget to find compatible companions.",
                  },
                  {
                    icon: Star,
                    title: "AI-Powered Plans",
                    desc: "Get personalized itineraries that balance everyone's preferences.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 text-primary-600">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-text-primary">
                        {item.title}
                      </h3>
                      <p className="text-sm text-text-secondary mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative card mockup */}
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-accent-100 rounded-3xl -rotate-3" />
              <div className="relative bg-surface rounded-3xl border border-border shadow-elevated p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-lg">🧳</span>
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-text-primary">
                      Istanbul Adventure
                    </div>
                    <div className="text-sm text-text-secondary">
                      July 15 - July 25
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Culture & History", "Food & Dining", "Photography"].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="text-sm text-text-secondary">
                    Budget: <span className="font-semibold text-text-primary">$800 - $1,500</span>
                  </div>
                  <div className="text-sm text-success font-medium">2 spots left</div>
                </div>

                {/* Second card preview */}
                <div className="mt-4 p-4 rounded-2xl bg-surface-tertiary border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                      <span className="text-base">🏖️</span>
                    </div>
                    <div>
                      <div className="font-heading font-semibold text-sm text-text-primary">
                        Bali Retreat
                      </div>
                      <div className="text-xs text-text-secondary">
                        Aug 1 - Aug 14
                      </div>
                    </div>
                    <div className="ml-auto">
                      <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                        Open
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 p-4 rounded-2xl bg-surface-tertiary border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-base">🗼</span>
                    </div>
                    <div>
                      <div className="font-heading font-semibold text-sm text-text-primary">
                        Tokyo Explorer
                      </div>
                      <div className="text-xs text-text-secondary">
                        Sep 5 - Sep 18
                      </div>
                    </div>
                    <div className="ml-auto">
                      <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                        Open
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-10 sm:p-16 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
                Ready for your next adventure?
              </h2>
              <p className="mt-4 text-lg text-primary-100 max-w-xl mx-auto">
                Join TripMate today and never travel alone again. Your next
                travel buddy is just a click away.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={ROUTES.REGISTER}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-primary-700 bg-white hover:bg-primary-50 rounded-2xl transition-colors shadow-elevated"
                >
                  Create free account
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border bg-surface-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600 text-white">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-lg font-heading font-bold text-text-primary">
                TripMate
              </span>
            </div>
            <p className="text-sm text-text-tertiary">
              &copy; {new Date().getFullYear()} TripMate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
