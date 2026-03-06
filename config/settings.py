"""
Choice Mini — Global configuration.
All thresholds, filters, and rules for the agent pipeline live here.
"""

# =============================================================================
# Scout Agent (Kalodata / Fastmoss)
# =============================================================================
SCOUT_SALES_VELOCITY_WINDOW_DAYS = 7
SCOUT_MAX_COMPETITORS = 10
SCOUT_MIN_DAILY_SALES = 500
SCOUT_MIN_CONVERSION_RATE = 0.15  # 15%

# =============================================================================
# Sourcing Agent (AutoDS)
# =============================================================================
SOURCING_SHIP_FROM = "US"
SOURCING_MAX_DELIVERY_DAYS = 7
SOURCING_MIN_SUPPLIER_SCORE = 4.5

# =============================================================================
# Creative Agent (Claude / PiPiAds)
# =============================================================================
CREATIVE_TOP_ADS_TO_SCRAPE = 3
CREATIVE_TONE = "game-like"  # Choice Aura tone
CREATIVE_USE_FOLLOW_UP_FORMULA = True

# =============================================================================
# Launch Agent
# =============================================================================
LAUNCH_MIN_PROFIT_MARGIN = 0.30  # 30% after all fees
LAUNCH_AUTO_SEO_TITLE = True
LAUNCH_PLATFORM = "tiktok_shop"  # "tiktok_shop" or "shopify"

# =============================================================================
# TikTok Shop Seller Center
# =============================================================================
TIKTOK_COMMISSION_RATE = 0.06    # TikTok's ~6% platform commission
TIKTOK_PAYMENT_FEE = 0.029      # ~2.9% payment processing
TIKTOK_FIXED_FEE = 0.30         # $0.30 per order
TIKTOK_AFFILIATE_COMMISSION = 0.20  # 20% affiliate commission (Jon Reiner method)

# =============================================================================
# Product quality filters (from research)
# =============================================================================
PRODUCT_MUST_HAVE = [
    "wow_factor",        # Has a wow factor
    "solves_problem",    # Solves a problem
    "easy_content",      # Easy to make content with
]
