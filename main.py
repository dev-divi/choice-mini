"""
Choice Mini — Shop Automation Command Center

Run the 4-agent pipeline with sample data to see the system in action.

Usage:
    python main.py
"""

from agents.orchestrator import Orchestrator


def main():
    # ── Sample market data (would come from Kalodata/Fastmoss API) ──────
    raw_products = [
        {
            "name": "LED Sunset Lamp",
            "category": "homegoods",
            "daily_sales": 780,
            "conversion_rate": 0.18,
            "active_competitors": 6,
            "qualities": ["wow_factor", "easy_content"],
        },
        {
            "name": "Posture Corrector Pro",
            "category": "health",
            "daily_sales": 520,
            "conversion_rate": 0.16,
            "active_competitors": 8,
            "qualities": ["solves_problem"],
        },
        {
            "name": "Basic Phone Case",
            "category": "electronics",
            "daily_sales": 300,
            "conversion_rate": 0.08,
            "active_competitors": 45,
            # Fails: low sales, low conversion, too many competitors
        },
        {
            "name": "Awesome Like My Daughter Tee",
            "category": "fashion",
            "daily_sales": 610,
            "conversion_rate": 0.22,
            "active_competitors": 3,
            "qualities": ["solves_problem", "easy_content"],
        },
    ]

    # ── Sample supplier data (would come from AutoDS API) ───────────────
    supplier_data = {
        "LED Sunset Lamp": [
            {
                "supplier_name": "US Lights Direct",
                "ships_from": "US",
                "delivery_days": 4,
                "reliability_score": 4.8,
                "unit_cost": 8.50,
            },
            {
                "supplier_name": "China Wholesale Co",
                "ships_from": "CN",
                "delivery_days": 14,
                "reliability_score": 4.2,
                "unit_cost": 3.20,
                # Fails: ships from CN, delivery too slow
            },
        ],
        "Posture Corrector Pro": [
            {
                "supplier_name": "HealthGear USA",
                "ships_from": "US",
                "delivery_days": 5,
                "reliability_score": 4.6,
                "unit_cost": 6.75,
            },
        ],
        "Awesome Like My Daughter Tee": [
            {
                "supplier_name": "PrintFlex US",
                "ships_from": "US",
                "delivery_days": 3,
                "reliability_score": 4.9,
                "unit_cost": 5.20,
            },
        ],
    }

    # ── Sample ad data (would come from PiPiAds scrape) ─────────────────
    ad_data = {
        "LED Sunset Lamp": [
            {"url": "https://pipads.example/ad/1", "hook_text": "This lamp transforms any room", "views": 1200000, "engagement_rate": 0.12},
            {"url": "https://pipads.example/ad/2", "hook_text": "POV: your room is now aesthetic", "views": 800000, "engagement_rate": 0.15},
            {"url": "https://pipads.example/ad/3", "hook_text": "Wait for the sunset effect", "views": 500000, "engagement_rate": 0.09},
        ],
        "Awesome Like My Daughter Tee": [
            {"url": "https://pipads.example/ad/4", "hook_text": "The perfect gift for any parent", "views": 600000, "engagement_rate": 0.20},
        ],
    }

    # ── Run the pipeline ────────────────────────────────────────────────
    orchestrator = Orchestrator()
    report = orchestrator.run(raw_products, supplier_data, ad_data)

    # ── Show a launched product's full creative ─────────────────────────
    for launch in report.launches:
        if launch.launched:
            print(f"\n{'='*60}")
            print(f"CREATIVE SCRIPT — {launch.product.name}")
            print(f"{'='*60}")
            print(launch.creative.full_script)
            print(f"\nFollow-up plan:")
            for step in launch.creative.follow_up_plan:
                print(f"  • {step}")
            platform = "TikTok Shop" if launch.platform == "tiktok_shop" else "Shopify"
            print(f"\nPlatform: {platform} (ID: {launch.product_id})")
            print(f"Title: {launch.seo_title}")
            print(f"Price: ${launch.listing_price}")
            print(f"Margin: {launch.profit_margin:.0%}")
            if launch.affiliate_commission:
                print(f"Affiliate: {launch.affiliate_commission:.0%} (${launch.affiliate_payout:.2f}/sale)")
            print()


if __name__ == "__main__":
    main()
