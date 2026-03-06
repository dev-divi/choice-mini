"""
Choice Mini — Web Dashboard

Run with: python app.py
Open: http://127.0.0.1:5000
"""

from flask import Flask, render_template
from agents.orchestrator import Orchestrator

app = Flask(__name__)


def get_demo_data():
    """Sample market data (same as main.py)."""
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

    supplier_data = {
        "LED Sunset Lamp": [
            {"supplier_name": "US Lights Direct", "ships_from": "US", "delivery_days": 4, "reliability_score": 4.8, "unit_cost": 8.50},
            {"supplier_name": "China Wholesale Co", "ships_from": "CN", "delivery_days": 14, "reliability_score": 4.2, "unit_cost": 3.20},
        ],
        "Posture Corrector Pro": [
            {"supplier_name": "HealthGear USA", "ships_from": "US", "delivery_days": 5, "reliability_score": 4.6, "unit_cost": 6.75},
        ],
        "Awesome Like My Daughter Tee": [
            {"supplier_name": "PrintFlex US", "ships_from": "US", "delivery_days": 3, "reliability_score": 4.9, "unit_cost": 5.20},
        ],
    }

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

    return raw_products, supplier_data, ad_data


@app.route("/")
def dashboard():
    raw_products, supplier_data, ad_data = get_demo_data()
    orchestrator = Orchestrator()
    report = orchestrator.run(raw_products, supplier_data, ad_data)

    summary = {
        "products_scanned": len(report.products_scouted),
        "products_qualified": len(report.products_qualified),
        "suppliers_matched": len(report.suppliers_found),
        "creatives_generated": len(report.creatives_generated),
        "launched": report.success_count,
        "total_candidates": len(report.launches),
    }

    qualified_names = {p.name for p in report.products_qualified}
    scout_phase = []
    for p in report.products_scouted:
        scout_phase.append({
            "name": p.name,
            "category": p.category,
            "daily_sales": p.daily_sales,
            "conversion_rate": p.conversion_rate,
            "active_competitors": p.active_competitors,
            "qualities": p.qualities,
            "qualified": p.name in qualified_names,
        })

    sourcing_phase = []
    for sm in report.suppliers_found:
        sourcing_phase.append({
            "product_name": sm.product.name,
            "supplier_name": sm.supplier_name,
            "ships_from": sm.ships_from,
            "delivery_days": sm.delivery_days,
            "reliability_score": sm.reliability_score,
            "unit_cost": sm.unit_cost,
        })

    creative_phase = []
    for c in report.creatives_generated:
        creative_phase.append({
            "product_name": c.product.name,
            "hook": c.hook,
            "body": c.body,
            "cta": c.cta,
            "tone": c.tone,
            "follow_up_plan": c.follow_up_plan,
        })

    launch_phase = []
    for lr in report.launches:
        launch_phase.append({
            "product_name": lr.product.name,
            "platform": lr.platform,
            "platform_label": "TikTok Shop" if lr.platform == "tiktok_shop" else "Shopify",
            "seo_title": lr.seo_title,
            "listing_price": lr.listing_price,
            "profit_margin": lr.profit_margin,
            "affiliate_commission": lr.affiliate_commission,
            "affiliate_payout": lr.affiliate_payout,
            "launched": lr.launched,
            "product_id": lr.product_id or "N/A",
        })

    return render_template(
        "dashboard.html",
        summary=summary,
        scout_phase=scout_phase,
        sourcing_phase=sourcing_phase,
        creative_phase=creative_phase,
        launch_phase=launch_phase,
    )


if __name__ == "__main__":
    print("\n  Choice Mini Command Center")
    print("  http://127.0.0.1:5000\n")
    app.run(debug=True, port=5000)
