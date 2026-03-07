"""
Launch Agent — Product Listing & Import

Supports two platforms:
  - TikTok Shop Seller Center (default) — list product + set affiliate commission
  - Shopify (via AutoDS API) — import product with SEO title

Logic:
  Uses AI to generate an optimized title.
  Sets pricing based on a 30% minimum profit margin after ALL fees
  (platform commission + payment processing + affiliate payout).
"""

from __future__ import annotations
import math
from datetime import datetime
from agents.models import Product, SupplierMatch, Creative, LaunchResult
from config import settings


class LaunchAgent:
    """Handles product listing, title generation, pricing, and affiliate setup."""

    name = "Launch"
    icon = "rocket"

    def __init__(self, platform: str | None = None):
        self.platform = platform or settings.LAUNCH_PLATFORM

    def _get_fees(self) -> dict:
        """Build fee structure from current settings (supports runtime override)."""
        return {
            "tiktok_shop": {
                "commission": settings.TIKTOK_COMMISSION_RATE,
                "payment": settings.TIKTOK_PAYMENT_FEE,
                "fixed": settings.TIKTOK_FIXED_FEE,
                "affiliate": settings.TIKTOK_AFFILIATE_COMMISSION,
            },
            "shopify": {
                "commission": 0.0,
                "payment": 0.029,
                "fixed": 0.30,
                "affiliate": 0.0,
            },
        }

    def generate_title(self, product: Product) -> str:
        """Generate an optimized product title for the target platform."""
        # In production this would call Claude API for AI-generated titles
        category_tag = product.category.replace("_", " ").title()
        if self.platform == "tiktok_shop":
            return f"{product.name} - {category_tag} | US Seller Fast Ship"
        return f"{product.name} - {category_tag} | Fast US Shipping"

    def calculate_price(self, supplier: SupplierMatch) -> tuple[float, float, float]:
        """
        Calculate listing price to hit minimum profit margin after ALL fees
        including affiliate commission.

        Returns (listing_price, actual_margin, affiliate_payout_per_sale).
        """
        fees = self._get_fees()[self.platform]
        cost = supplier.unit_cost
        min_margin = settings.LAUNCH_MIN_PROFIT_MARGIN

        # Total percentage fees: platform + payment + affiliate
        total_pct_fees = fees["commission"] + fees["payment"] + fees["affiliate"]

        # Price = cost / (1 - margin - total_pct_fees) + fixed_fee
        denominator = 1.0 - min_margin - total_pct_fees
        if denominator <= 0:
            # Margins too tight with affiliate cut, set at 3x cost as fallback
            price = cost * 3.0
        else:
            price = (cost / denominator) + fees["fixed"]

        # Round up to .99 pricing (add buffer before ceiling to absorb rounding loss)
        price = math.ceil(price + 0.50) - 0.01

        # Calculate actual numbers
        revenue = price
        platform_fees = (
            (revenue * fees["commission"])
            + (revenue * fees["payment"])
            + fees["fixed"]
        )
        affiliate_payout = revenue * fees["affiliate"]
        actual_margin = (revenue - cost - platform_fees - affiliate_payout) / revenue if revenue > 0 else 0

        return price, actual_margin, affiliate_payout

    def list_product(
        self,
        product: Product,
        supplier: SupplierMatch,
        title: str,
        price: float,
    ) -> str | None:
        """
        List product on the target platform.
        Returns the product ID on success, None on failure.

        Currently returns a placeholder for the pipeline scaffold.
        """
        if self.platform == "tiktok_shop":
            # TODO: Integrate TikTok Shop Seller Center API
            # tiktok_api.create_product(title=title, price=price, ...)
            # tiktok_api.set_affiliate_commission(product_id, rate=affiliate_rate)
            return f"TTS-{hash(product.name) % 100000:05d}"
        else:
            # TODO: Integrate AutoDS API for Shopify imports
            # autods.import_product(supplier.supplier_url, shopify_store, title=title, price=price)
            return f"SHOP-{hash(product.name) % 100000:05d}"

    def run(
        self,
        product: Product,
        supplier: SupplierMatch,
        creative: Creative,
    ) -> LaunchResult:
        """Full launch pipeline: title -> pricing -> list -> result."""
        title = self.generate_title(product)
        price, margin, affiliate_payout = self.calculate_price(supplier)
        fees = self._get_fees()[self.platform]

        result = LaunchResult(
            product=product,
            supplier=supplier,
            creative=creative,
            platform=self.platform,
            seo_title=title,
            listing_price=price,
            profit_margin=margin,
            affiliate_commission=fees["affiliate"],
            affiliate_payout=affiliate_payout,
        )

        if not result.is_profitable:
            return result

        product_id = self.list_product(product, supplier, title, price)
        if product_id:
            result.product_id = product_id
            result.launched = True
            result.launched_at = datetime.now()

        return result
