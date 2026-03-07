"""
Sourcing Agent — Supplier Matching (AutoDS Marketplace)

Logic:
  Use AutoDS Marketplace to find the product.
  Filter strictly by "Ships from US" and "Delivery < 7 days"
  to avoid TikTok Shop shipping violations.

Validation:
  Supplier Reliability Score must be 4.5+.
"""

from __future__ import annotations
from agents.models import Product, SupplierMatch
from config import settings


class SourcingAgent:
    """Finds and validates suppliers for qualified products via AutoDS."""

    name = "Sourcing"
    icon = "📦"

    def find_suppliers(self, product: Product, supplier_results: list[dict]) -> list[SupplierMatch]:
        """
        Takes raw supplier data (from AutoDS API or scrape) and returns
        validated supplier matches.

        Each dict in supplier_results should have:
            supplier_name, ships_from, delivery_days, reliability_score, unit_cost
            Optional: supplier_url
        """
        matches = []
        for data in supplier_results:
            match = SupplierMatch(
                product=product,
                supplier_name=data["supplier_name"],
                ships_from=data["ships_from"],
                delivery_days=data["delivery_days"],
                reliability_score=data["reliability_score"],
                unit_cost=data["unit_cost"],
                supplier_url=data.get("supplier_url", ""),
            )
            matches.append(match)

        return matches

    def validate(self, matches: list[SupplierMatch]) -> list[SupplierMatch]:
        """Filter to only suppliers that meet shipping and reliability requirements."""
        return [m for m in matches if m.is_valid]

    def best_match(self, matches: list[SupplierMatch]) -> SupplierMatch | None:
        """Pick the best supplier: highest reliability, then lowest cost."""
        valid = self.validate(matches)
        if not valid:
            return None
        return sorted(valid, key=lambda m: (-m.reliability_score, m.unit_cost))[0]

    def run(self, product: Product, supplier_results: list[dict]) -> SupplierMatch | None:
        """Full sourcing pipeline: find → validate → pick best."""
        found = self.find_suppliers(product, supplier_results)
        return self.best_match(found)
