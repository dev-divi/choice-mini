"""
Choice Mini — Orchestrator (The Command Center)

This is the RTS "player interface" that runs the full agent pipeline:

  Scout → Sourcing → Creative → Launch

The player (you) defines strategy via config/settings.py.
The agents handle execution.
"""

from __future__ import annotations
from datetime import datetime
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

from agents.models import AgentStatus, PipelineReport
from agents.scout import ScoutAgent
from agents.sourcing import SourcingAgent
from agents.creative import CreativeAgent
from agents.launch import LaunchAgent

console = Console(force_terminal=True)


class Orchestrator:
    """
    The Command Center — runs the full 4-agent pipeline.

    Think of this as your top-down RTS view:
    - You feed it market data (products + suppliers + ads)
    - It runs Scout → Sourcing → Creative → Launch
    - It reports back what launched and what didn't
    """

    def __init__(self):
        self.scout = ScoutAgent()
        self.sourcing = SourcingAgent()
        self.creative = CreativeAgent()
        self.launch = LaunchAgent()
        self.status = AgentStatus.IDLE

    def run(
        self,
        raw_products: list[dict],
        supplier_data: dict[str, list[dict]] | None = None,
        ad_data: dict[str, list[dict]] | None = None,
    ) -> PipelineReport:
        """
        Execute the full pipeline.

        Args:
            raw_products: List of product dicts for the Scout to evaluate.
            supplier_data: Map of product_name → list of supplier dicts.
            ad_data: Map of product_name → list of ad dicts from PiPiAds.

        Returns:
            PipelineReport with all results.
        """
        supplier_data = supplier_data or {}
        ad_data = ad_data or {}
        report = PipelineReport()

        # ── Phase 1: Scout ──────────────────────────────────────────────
        self.status = AgentStatus.SCOUTING
        console.print(Panel("[bold cyan]Phase 1: Scout Agent — Scanning market...[/]"))

        all_products = self.scout.scan(raw_products)
        report.products_scouted = all_products
        qualified = self.scout.qualify(all_products)
        report.products_qualified = qualified

        console.print(f"  Scanned {len(all_products)} products -> {len(qualified)} qualified")

        if not qualified:
            console.print("[yellow]  No products met scout thresholds. Pipeline complete.[/]")
            self.status = AgentStatus.DONE
            report.finished_at = datetime.now()
            return report

        # ── Phase 2: Sourcing ───────────────────────────────────────────
        self.status = AgentStatus.SOURCING
        console.print(Panel("[bold green]Phase 2: Sourcing Agent — Finding suppliers...[/]"))

        sourced_products = []
        for product in qualified:
            suppliers = supplier_data.get(product.name, [])
            if not suppliers:
                console.print(f"  [dim]{product.name}: no supplier data, skipping[/]")
                continue

            best = self.sourcing.run(product, suppliers)
            if best:
                report.suppliers_found.append(best)
                sourced_products.append((product, best))
                console.print(
                    f"  {product.name}: matched -> {best.supplier_name} "
                    f"(score {best.reliability_score}, ${best.unit_cost})"
                )
            else:
                console.print(f"  [yellow]{product.name}: no valid supplier found[/]")

        if not sourced_products:
            console.print("[yellow]  No valid suppliers. Pipeline complete.[/]")
            self.status = AgentStatus.DONE
            report.finished_at = datetime.now()
            return report

        # ── Phase 3: Creative ───────────────────────────────────────────
        self.status = AgentStatus.CREATING
        console.print(Panel("[bold magenta]Phase 3: Creative Agent — Generating content...[/]"))

        creative_products = []
        for product, supplier in sourced_products:
            ads = ad_data.get(product.name, [])
            creative = self.creative.run(product, ads)
            report.creatives_generated.append(creative)
            creative_products.append((product, supplier, creative))
            console.print(f"  {product.name}: script generated ({len(creative.follow_up_plan)} follow-ups)")

        # ── Phase 4: Launch ─────────────────────────────────────────────
        self.status = AgentStatus.LAUNCHING
        console.print(Panel("[bold red]Phase 4: Launch Agent — Deploying to Shopify...[/]"))

        for product, supplier, creative in creative_products:
            result = self.launch.run(product, supplier, creative)
            report.launches.append(result)
            if result.launched:
                console.print(
                    f"  [green]{product.name}: LAUNCHED[/] -> "
                    f"${result.listing_price} ({result.profit_margin:.0%} margin) "
                    f"[dim]ID: {result.product_id}[/]"
                )
            else:
                console.print(
                    f"  [red]{product.name}: NOT LAUNCHED[/] - "
                    f"margin {result.profit_margin:.0%} below minimum"
                )

        # ── Done ────────────────────────────────────────────────────────
        self.status = AgentStatus.DONE
        report.finished_at = datetime.now()
        self._print_report(report)
        return report

    def _print_report(self, report: PipelineReport) -> None:
        """Print a summary table of the pipeline run."""
        table = Table(title="Pipeline Report", show_lines=True)
        table.add_column("Metric", style="bold")
        table.add_column("Value", justify="right")
        table.add_row("Products Scanned", str(len(report.products_scouted)))
        table.add_row("Products Qualified", str(len(report.products_qualified)))
        table.add_row("Suppliers Matched", str(len(report.suppliers_found)))
        table.add_row("Creatives Generated", str(len(report.creatives_generated)))
        table.add_row("Launched", str(report.success_count))
        table.add_row("Total Candidates", str(len(report.launches)))
        console.print(table)
