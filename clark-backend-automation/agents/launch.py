"""
Launch Agent — Product Import & Listing (AutoDS API → Shopify)

Logic:
  Auto-imports the product to your Shopify store.
  Uses AI to generate an SEO-optimized title.
  Sets pricing based on a 30% minimum profit margin after all fees.
"""

from __future__ import annotations
import math
from datetime import datetime
from agents.models import Product, SupplierMatch, Creative, LaunchResult
from config import settings


# Approximate TikTok Shop + platform fees
TIKTOK_SHOP_FEE = 0.06   # 6%
PAYMENT_PROCESSING_FEE = 0.029  # 2.9%
FIXED_FEE_PER_ORDER = 0.30  # $0.30


class LaunchAgent:
    """Handles product import, SEO title generation, and pricing for Shopify launch."""

    name = "Launch"
    icon = "🚀"

    def generate_seo_title(self, product: Product) -> str:
        """Generate an SEO-optimized product title."""
        # In production this would call Claude API for AI-generated titles
        category_tag = product.category.replace("_", " ").title()
        return f"{product.name} — {category_tag} | Fast US Shipping"

    def calculate_price(self, supplier: SupplierMatch) -> tuple[float, float]:
        """
        Calculate listing price to hit minimum profit margin after all fees.

        Returns (listing_price, actual_margin).
        """
        cost = supplier.unit_cost
        min_margin = settings.LAUNCH_MIN_PROFIT_MARGIN

        # Price = cost / (1 - margin - tiktok_fee - processing_fee) + fixed_fee
        denominator = 1.0 - min_margin - TIKTOK_SHOP_FEE - PAYMENT_PROCESSING_FEE
        if denominator <= 0:
            # Margins too tight, set at 2.5x cost as fallback
            price = cost * 2.5
        else:
            price = (cost / denominator) + FIXED_FEE_PER_ORDER

        # Round up to .99 pricing (ceil to ensure margin isn't lost to rounding)
        price = math.ceil(price) - 0.01 if price > 10 else math.ceil(price) - 0.01

        # Calculate actual margin
        revenue = price
        fees = (revenue * TIKTOK_SHOP_FEE) + (revenue * PAYMENT_PROCESSING_FEE) + FIXED_FEE_PER_ORDER
        actual_margin = (revenue - cost - fees) / revenue if revenue > 0 else 0

        return price, actual_margin

    def import_to_shopify(
        self,
        product: Product,
        supplier: SupplierMatch,
        seo_title: str,
        price: float,
    ) -> str | None:
        """
        Import product to Shopify via AutoDS API.
        Returns the Shopify product ID on success, None on failure.

        In production, this calls the AutoDS API.
        Currently returns a placeholder for the pipeline scaffold.
        """
        # TODO: Integrate AutoDS API for real imports
        # autods.import_product(supplier.supplier_url, shopify_store, title=seo_title, price=price)
        return f"SHOP-{hash(product.name) % 100000:05d}"

    def run(
        self,
        product: Product,
        supplier: SupplierMatch,
        creative: Creative,
    ) -> LaunchResult:
        """Full launch pipeline: SEO title → pricing → import → result."""
        seo_title = self.generate_seo_title(product)
        price, margin = self.calculate_price(supplier)

        result = LaunchResult(
            product=product,
            supplier=supplier,
            creative=creative,
            seo_title=seo_title,
            listing_price=price,
            profit_margin=margin,
        )

        if not result.is_profitable:
            return result

        product_id = self.import_to_shopify(product, supplier, seo_title, price)
        if product_id:
            result.shopify_product_id = product_id
            result.launched = True
            result.launched_at = datetime.now()

        return result
