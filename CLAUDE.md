# CLAUDE.md

## Project: choice-mini

AI-powered shop automation platform — modeled like a real-time strategy (RTS) game.

## Vision

The business is treated as a digital, top-down map where specialized AI agents manage key domains:

- **Resources** — Inventory management and supply chain (Sourcing + Launch agents)
- **Units** — Staff coordination and marketing automation (Creative agent)
- **Tech upgrades** — Dynamic pricing and optimization (Scout agent + config)

The user acts as the "player," defining high-level strategies in `config/settings.py` while AI agents handle execution based on real-time data.

## Architecture: 4-Agent Pipeline

```
Scout → Sourcing → Creative → Launch
(Kalodata)  (AutoDS)   (Claude)   (AutoDS API → Shopify)
```

### Agent Roles

1. **Scout Agent** (`agents/scout.py`) — Product discovery via Kalodata/Fastmoss
   - Filters for sales velocity spikes (7-day window)
   - Requires: 500+ daily sales, 15%+ conversion, <10 competitors
2. **Sourcing Agent** (`agents/sourcing.py`) — Supplier matching via AutoDS
   - Strict filters: Ships from US, delivery <7 days, reliability 4.5+
3. **Creative Agent** (`agents/creative.py`) — Ad copy & content via Claude/PiPiAds
   - Scrapes top 3 ads, rewrites with "game-like" Choice Aura tone
   - Includes follow-up formula from viral research
4. **Launch Agent** (`agents/launch.py`) — Product import via AutoDS API
   - SEO-optimized titles, 30% minimum margin pricing, Shopify import

### Orchestrator

`agents/orchestrator.py` — The Command Center that runs all 4 phases sequentially and prints a pipeline report.

## Repository Structure

```
choice-mini/
├── CLAUDE.md                  # This file
├── README.md                  # Project overview
├── main.py                    # Entry point — run the pipeline
├── requirements.txt           # Python dependencies
├── config/
│   ├── __init__.py
│   └── settings.py            # All thresholds, filters, rules
├── agents/
│   ├── __init__.py
│   ├── models.py              # Data models (Product, SupplierMatch, Creative, LaunchResult)
│   ├── scout.py               # Scout Agent
│   ├── sourcing.py            # Sourcing Agent
│   ├── creative.py            # Creative Agent
│   ├── launch.py              # Launch Agent
│   └── orchestrator.py        # Pipeline orchestrator
└── SECOND_BRAIN/
    ├── VIRAL_REF/
    │   ├── viral_video_analysis.md     # 1000 viral video analysis findings
    │   └── jonreiner_case_study.md     # Jon Reiner case study & methods
    ├── FUTURE_GOALS/
    │   └── larp.md                     # Aspirational goals
    └── TOOLS/
        └── market_research.md          # Tool reference (Kalodata, Fastmoss, PiPiAds, AutoDS)
```

## Conventions

- Python 3.11+
- Line endings: LF normalization (`.gitattributes`)
- Config-driven: all agent thresholds in `config/settings.py`
- Data models in `agents/models.py` — agents pass typed data between phases

## Development

```bash
pip install -r requirements.txt
python main.py
```

## Key Research Insights (from SECOND_BRAIN)

- Sweet spot for videos: 100K-800K views with high engagement
- Contrast principle: show problem → show solution = highest conversions
- Follow-up formula: 7-day content plan after viral hit
- Products that sell: wow factor + solves problem + easy to create content with
- TikTok algorithm rewards sales-driving content over pure entertainment
