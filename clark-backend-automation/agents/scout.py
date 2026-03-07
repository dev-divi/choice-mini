"""
Scout Agent — Product Discovery (Kalodata / Fastmoss)

Logic:
  Filter for products with a sales velocity spike in the last 7 days
  but fewer than 10 active competitors.

Trigger:
  If a product hits 500 sales/day with a 15% conversion rate → pass to Sourcing.
"""

from __future__ import annotations
from agents.models import Product
from config import settings


class ScoutAgent:
    """Scans market research platforms for trending products with low competition."""

    name = "Scout"
    icon = "🔭"

    def __init__(self, source: str = "kalodata"):
        self.source = source  # kalodata | fastmoss

    def scan(self, raw_products: list[dict]) -> list[Product]:
        """
        Takes raw product data (from Kalodata/Fastmoss API or scrape)
        and returns only qualified products.

        Each dict in raw_products should have:
            name, category, daily_sales, conversion_rate, active_competitors
            Optional: qualities (list of str)
        """
        products = []
        for data in raw_products:
            product = Product(
                name=data["name"],
                category=data.get("category", "unknown"),
                daily_sales=data["daily_sales"],
                conversion_rate=data["conversion_rate"],
                active_competitors=data["active_competitors"],
                trend_spike_days=data.get("trend_spike_days", settings.SCOUT_SALES_VELOCITY_WINDOW_DAYS),
                source=self.source,
                qualities=data.get("qualities", []),
            )
            products.append(product)

        return products

    def qualify(self, products: list[Product]) -> list[Product]:
        """Filter to only products that meet the scout thresholds."""
        return [p for p in products if p.is_qualified]

    def run(self, raw_products: list[dict]) -> list[Product]:
        """Full scout pipeline: scan → qualify."""
        scanned = self.scan(raw_products)
        qualified = self.qualify(scanned)
        return qualified
