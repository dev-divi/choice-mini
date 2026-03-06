"""
Creative Agent — Ad Copy & Content Strategy (Claude / PiPiAds)

Logic:
  Scrapes the top 3 performing ads for the product on PiPiAds.
  Rewrites the hook using Choice Aura "game-like" tone
  and the Follow-up Formula from viral video research.
"""

from __future__ import annotations
from agents.models import Product, Creative
from config import settings


# Follow-up Formula (from viral TikTok analysis research)
FOLLOW_UP_FORMULA = [
    "Day 1: Video goes viral",
    "Day 2-3: Answer the most common questions from comments",
    "Day 4-5: Create video responses addressing purchase objections",
    "Day 6-7: Share social proof and testimonial content",
]

# Tone templates for the Choice Aura "game-like" voice
HOOK_TEMPLATES = [
    "You just unlocked a {category} upgrade that {benefit}.",
    "Level up your {category} game - {benefit}.",
    "New drop alert: {product_name} just entered the arena.",
    "Your {category} loadout is missing this one item.",
]


class CreativeAgent:
    """Generates ad scripts and content plans using the Choice Aura tone."""

    name = "Creative"
    icon = "🎨"

    def scrape_top_ads(self, product: Product, ad_data: list[dict]) -> list[str]:
        """
        Takes raw ad data (from PiPiAds or similar) and extracts hooks.

        Each dict should have: url, hook_text, views, engagement_rate
        Returns top N ad URLs sorted by engagement.
        """
        sorted_ads = sorted(ad_data, key=lambda a: a.get("engagement_rate", 0), reverse=True)
        top = sorted_ads[:settings.CREATIVE_TOP_ADS_TO_SCRAPE]
        return [ad["url"] for ad in top]

    def generate_hook(self, product: Product, reference_hooks: list[str] | None = None) -> str:
        """
        Generate a hook in the Choice Aura game-like tone.
        Uses reference hooks from top ads as inspiration.
        """
        template = HOOK_TEMPLATES[hash(product.name) % len(HOOK_TEMPLATES)]
        benefit = "changes the game" if not reference_hooks else "your audience is already asking for"
        return template.format(
            category=product.category,
            benefit=benefit,
            product_name=product.name,
        )

    def generate_body(self, product: Product) -> str:
        """Generate the body copy using the contrast principle."""
        return (
            f"Here's the problem: everyone's stuck with the same old {product.category} options. "
            f"But {product.name} flips the script. "
            f"Watch the before and after and you'll see why {product.daily_sales}+ people "
            f"grabbed this in the last week."
        )

    def generate_cta(self, product: Product) -> str:
        """Direct CTA — algorithm rewards direct calls to action over subtle suggestions."""
        return f"Tap the link and grab {product.name} before it sells out. GG."

    def build_follow_up_plan(self) -> list[str]:
        """Return the follow-up formula from viral research."""
        if settings.CREATIVE_USE_FOLLOW_UP_FORMULA:
            return list(FOLLOW_UP_FORMULA)
        return []

    def run(self, product: Product, ad_data: list[dict] | None = None) -> Creative:
        """Full creative pipeline: research ads → generate script → plan follow-ups."""
        ad_data = ad_data or []
        reference_ads = self.scrape_top_ads(product, ad_data) if ad_data else []
        reference_hooks = [ad.get("hook_text", "") for ad in ad_data[:3]] if ad_data else []

        return Creative(
            product=product,
            hook=self.generate_hook(product, reference_hooks),
            body=self.generate_body(product),
            cta=self.generate_cta(product),
            tone=settings.CREATIVE_TONE,
            reference_ads=reference_ads,
            follow_up_plan=self.build_follow_up_plan(),
        )
