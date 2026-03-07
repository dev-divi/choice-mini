"""
Choice Mini — Web Dashboard (Interactive)

Run with: python app.py
Open: http://127.0.0.1:5000
"""

import json
import os

from flask import Flask, render_template, request, redirect, url_for, jsonify
from config import settings as settings_module
from agents.orchestrator import Orchestrator

app = Flask(__name__)

STATE_FILE = os.path.join(os.path.dirname(__file__), "data", "state.json")

# ── Settings mapping: state key -> (settings module attribute, type cast) ────

SETTINGS_MAP = {
    "scout_min_daily_sales": ("SCOUT_MIN_DAILY_SALES", int),
    "scout_min_conversion_rate": ("SCOUT_MIN_CONVERSION_RATE", float),
    "scout_max_competitors": ("SCOUT_MAX_COMPETITORS", int),
    "scout_sales_velocity_window_days": ("SCOUT_SALES_VELOCITY_WINDOW_DAYS", int),
    "sourcing_ship_from": ("SOURCING_SHIP_FROM", str),
    "sourcing_max_delivery_days": ("SOURCING_MAX_DELIVERY_DAYS", int),
    "sourcing_min_supplier_score": ("SOURCING_MIN_SUPPLIER_SCORE", float),
    "creative_top_ads_to_scrape": ("CREATIVE_TOP_ADS_TO_SCRAPE", int),
    "creative_tone": ("CREATIVE_TONE", str),
    "creative_use_follow_up_formula": ("CREATIVE_USE_FOLLOW_UP_FORMULA", bool),
    "launch_min_profit_margin": ("LAUNCH_MIN_PROFIT_MARGIN", float),
    "launch_auto_seo_title": ("LAUNCH_AUTO_SEO_TITLE", bool),
    "launch_platform": ("LAUNCH_PLATFORM", str),
    "tiktok_commission_rate": ("TIKTOK_COMMISSION_RATE", float),
    "tiktok_payment_fee": ("TIKTOK_PAYMENT_FEE", float),
    "tiktok_fixed_fee": ("TIKTOK_FIXED_FEE", float),
    "tiktok_affiliate_commission": ("TIKTOK_AFFILIATE_COMMISSION", float),
}


# ── Demo data ────────────────────────────────────────────────────────────────

DEMO_PRODUCTS = [
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
        "qualities": [],
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

DEMO_SUPPLIERS = {
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

DEMO_ADS = {
    "LED Sunset Lamp": [
        {"url": "https://pipads.example/ad/1", "hook_text": "This lamp transforms any room", "views": 1200000, "engagement_rate": 0.12},
        {"url": "https://pipads.example/ad/2", "hook_text": "POV: your room is now aesthetic", "views": 800000, "engagement_rate": 0.15},
        {"url": "https://pipads.example/ad/3", "hook_text": "Wait for the sunset effect", "views": 500000, "engagement_rate": 0.09},
    ],
    "Awesome Like My Daughter Tee": [
        {"url": "https://pipads.example/ad/4", "hook_text": "The perfect gift for any parent", "views": 600000, "engagement_rate": 0.20},
    ],
}


# ── State management ─────────────────────────────────────────────────────────

def get_default_settings():
    return {key: getattr(settings_module, attr) for key, (attr, _) in SETTINGS_MAP.items()}


def get_default_state():
    return {
        "settings": get_default_settings(),
        "products": [dict(p) for p in DEMO_PRODUCTS],
        "suppliers": {k: [dict(s) for s in v] for k, v in DEMO_SUPPLIERS.items()},
        "ads": {k: [dict(a) for a in v] for k, v in DEMO_ADS.items()},
    }


def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as f:
            return json.load(f)
    return get_default_state()


def save_state(state):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def apply_settings_override(settings_dict):
    for key, (attr, cast) in SETTINGS_MAP.items():
        if key in settings_dict:
            setattr(settings_module, attr, cast(settings_dict[key]))


def parse_settings_from_form(form):
    result = {}
    for key, (_, cast) in SETTINGS_MAP.items():
        if cast == bool:
            result[key] = key in form
        elif key in form and form[key].strip():
            result[key] = cast(form[key])
    return result


# ── Pipeline runner ──────────────────────────────────────────────────────────

def run_pipeline(state):
    apply_settings_override(state["settings"])

    orchestrator = Orchestrator()
    report = orchestrator.run(
        state["products"],
        state.get("suppliers", {}),
        state.get("ads", {}),
    )

    summary = {
        "products_scanned": len(report.products_scouted),
        "products_qualified": len(report.products_qualified),
        "suppliers_matched": len(report.suppliers_found),
        "creatives_generated": len(report.creatives_generated),
        "launched": report.success_count,
        "total_candidates": len(report.launches),
    }

    qualified_names = {p.name for p in report.products_qualified}
    scout_phase = [
        {
            "name": p.name,
            "category": p.category,
            "daily_sales": p.daily_sales,
            "conversion_rate": p.conversion_rate,
            "active_competitors": p.active_competitors,
            "qualities": p.qualities,
            "qualified": p.name in qualified_names,
        }
        for p in report.products_scouted
    ]

    sourcing_phase = [
        {
            "product_name": sm.product.name,
            "supplier_name": sm.supplier_name,
            "ships_from": sm.ships_from,
            "delivery_days": sm.delivery_days,
            "reliability_score": sm.reliability_score,
            "unit_cost": sm.unit_cost,
        }
        for sm in report.suppliers_found
    ]

    creative_phase = [
        {
            "product_name": c.product.name,
            "hook": c.hook,
            "body": c.body,
            "cta": c.cta,
            "tone": c.tone,
            "follow_up_plan": c.follow_up_plan,
        }
        for c in report.creatives_generated
    ]

    launch_phase = [
        {
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
        }
        for lr in report.launches
    ]

    return summary, scout_phase, sourcing_phase, creative_phase, launch_phase


# ── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def dashboard():
    state = load_state()
    summary, scout_phase, sourcing_phase, creative_phase, launch_phase = run_pipeline(state)

    return render_template(
        "dashboard.html",
        summary=summary,
        scout_phase=scout_phase,
        sourcing_phase=sourcing_phase,
        creative_phase=creative_phase,
        launch_phase=launch_phase,
        state=state,
    )


@app.route("/run", methods=["POST"])
def run_with_settings():
    state = load_state()
    state["settings"] = parse_settings_from_form(request.form)
    save_state(state)
    return redirect(url_for("dashboard"))


@app.route("/reset", methods=["POST"])
def reset_state():
    state = get_default_state()
    save_state(state)
    return redirect(url_for("dashboard"))


# ── Product API ──────────────────────────────────────────────────────────────

@app.route("/api/products", methods=["POST"])
def add_product():
    state = load_state()
    product = request.get_json()
    product["daily_sales"] = int(product.get("daily_sales", 0))
    product["conversion_rate"] = float(product.get("conversion_rate", 0))
    product["active_competitors"] = int(product.get("active_competitors", 0))
    if isinstance(product.get("qualities"), str):
        product["qualities"] = [q.strip() for q in product["qualities"].split(",") if q.strip()]
    elif not product.get("qualities"):
        product["qualities"] = []
    state["products"].append(product)
    save_state(state)
    return jsonify({"status": "ok", "count": len(state["products"])})


@app.route("/api/products/<int:index>", methods=["DELETE"])
def delete_product(index):
    state = load_state()
    if 0 <= index < len(state["products"]):
        removed = state["products"].pop(index)
        name = removed.get("name", "")
        state["suppliers"].pop(name, None)
        state["ads"].pop(name, None)
        save_state(state)
    return jsonify({"status": "ok"})


# ── Supplier API ─────────────────────────────────────────────────────────────

@app.route("/api/suppliers/<product_name>", methods=["POST"])
def add_supplier(product_name):
    state = load_state()
    supplier = request.get_json()
    supplier["delivery_days"] = int(supplier.get("delivery_days", 0))
    supplier["reliability_score"] = float(supplier.get("reliability_score", 0))
    supplier["unit_cost"] = float(supplier.get("unit_cost", 0))
    if product_name not in state["suppliers"]:
        state["suppliers"][product_name] = []
    state["suppliers"][product_name].append(supplier)
    save_state(state)
    return jsonify({"status": "ok"})


@app.route("/api/suppliers/<product_name>/<int:index>", methods=["DELETE"])
def delete_supplier(product_name, index):
    state = load_state()
    suppliers = state["suppliers"].get(product_name, [])
    if 0 <= index < len(suppliers):
        suppliers.pop(index)
        if not suppliers:
            state["suppliers"].pop(product_name, None)
        save_state(state)
    return jsonify({"status": "ok"})


# ── Ad API ───────────────────────────────────────────────────────────────────

@app.route("/api/ads/<product_name>", methods=["POST"])
def add_ad(product_name):
    state = load_state()
    ad = request.get_json()
    ad["views"] = int(ad.get("views", 0))
    ad["engagement_rate"] = float(ad.get("engagement_rate", 0))
    if product_name not in state["ads"]:
        state["ads"][product_name] = []
    state["ads"][product_name].append(ad)
    save_state(state)
    return jsonify({"status": "ok"})


@app.route("/api/ads/<product_name>/<int:index>", methods=["DELETE"])
def delete_ad(product_name, index):
    state = load_state()
    ads = state["ads"].get(product_name, [])
    if 0 <= index < len(ads):
        ads.pop(index)
        if not ads:
            state["ads"].pop(product_name, None)
        save_state(state)
    return jsonify({"status": "ok"})


# ── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("\n  Choice Mini Command Center")
    print("  http://127.0.0.1:5000\n")
    app.run(debug=True, port=5000)
