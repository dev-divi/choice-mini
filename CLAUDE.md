# CLAUDE.md — choice-mini (Monorepo)

## Overview

Master repository for Choice automation projects.

## Projects

### clark-backend-automation/
AI-powered shop automation platform — 4-agent pipeline (Scout → Sourcing → Creative → Launch) that discovers trending products, finds suppliers, generates ad copy, and launches to Shopify. See `clark-backend-automation/CLAUDE.md` for full details.

### command-center/
Central dashboard and control interface — **LIVE**. React+Vite app (`choice-aura-command-center/`). Operator HUD with 8 tabs: Infrastructure, Projects, Agents, Player Profile, Game Blocks, Codex, Field Research, Strategies. Run with `npm run dev` inside `command-center/choice-aura-command-center/`.

## Repository Structure

```
choice-mini/
├── CLAUDE.md                       # This file (monorepo root)
├── .gitignore
├── .gitattributes
├── clark-backend-automation/       # AI shop automation pipeline
│   ├── CLAUDE.md                   # Project-specific docs
│   ├── main.py                     # Entry point
│   ├── requirements.txt
│   ├── agents/                     # 4-agent pipeline
│   ├── config/                     # Settings & thresholds
│   └── SECOND_BRAIN/               # Research knowledge base
└── command-center/                 # Operator HUD dashboard (LIVE)
    └── choice-aura-command-center/ # React+Vite app (npm run dev)
```

## Conventions

- Python 3.11+
- Line endings: LF normalization (`.gitattributes`)
- Each project has its own `CLAUDE.md` with project-specific instructions
