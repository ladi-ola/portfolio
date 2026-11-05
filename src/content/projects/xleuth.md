---
slug: xleuth
order: 1
title: Xleuth
summary: A leveraged trading platform for prediction market index baskets.
cardSummary: A leveraged trading platform for prediction market index baskets
status: Live on testnet (Polygon Amoy). Not live-money. Withdrawals are intentionally disabled in the testnet MVP.
role: 'Founder. Product designer and full-stack builder: product strategy, design, architecture and code, solo.'
dates: July 2026 to present
tags: [Product design, Full-stack development, Prediction markets]
cover: xleuth-light.png
links: []
diagram:
  description: Polymarket data sources flow through ingestion and the oracle to on-chain contracts. The React app connects through the backend API and matching engine to settlement and on-chain contracts. Dynamic handles sign-in.
  width: 720
  height: 560
  nodes:
    - { id: sources, label: Polymarket data, detail: Gamma · CLOB · Data API, x: 30, y: 30 }
    - { id: ingestion, label: data-ingestion, detail: Basket constituents, x: 270, y: 30 }
    - { id: oracle, label: oracle-service, detail: Index prices on-chain, x: 510, y: 30 }
    - { id: app, label: React app, detail: Mobile-first PWA, x: 30, y: 230 }
    - { id: api, label: backend-api, detail: FastAPI · REST / WebSocket, x: 270, y: 230 }
    - { id: contracts, label: On-chain contracts, detail: Polygon Amoy, x: 510, y: 230 }
    - { id: dynamic, label: Dynamic, detail: Sign-in · embedded wallets, x: 30, y: 430 }
    - { id: matching, label: matching-engine, detail: Orders · margin checks, x: 270, y: 430 }
    - { id: settlement, label: Settlement, detail: Settlement submission, x: 510, y: 430 }
  edges:
    - { from: sources, to: ingestion }
    - { from: ingestion, to: oracle }
    - { from: oracle, to: contracts }
    - { from: app, to: api }
    - { from: dynamic, to: app }
    - { from: api, to: matching }
    - { from: matching, to: settlement }
    - { from: settlement, to: contracts }
---

## The problem and idea

Prediction markets such as Polymarket let people trade on single outcomes, but there is no simple way to take a leveraged view on a whole theme, for example “the 20 biggest markets resolving in September”. Xleuth packages many markets into an index basket and lets traders go long or short that basket with leverage.

## What it does

- Index baskets of prediction markets, named by the convention `THEME+COUNT-WINDOW` (e.g. `TOP20-SEPTEMBER`: topic or selection method, number of markets, resolution window).
- A cash-settled, dated index future (not a perpetual) that settles to the realised volume-weighted YES fraction of the basket.
- Leverage from 1x to 5x, with USDC collateral.
- Order types: limit, market, stop, and stop-loss / take-profit brackets.
  - Market orders are fill-or-kill, with a max-slippage guard (never fills beyond the trader’s accepted price).
  - Stop orders convert to market orders when triggered (breakout entries).
  - SL/TP are bracket-style: attached to an open position, one-cancels-other, full close only, triggered on the index (mark) price.
- Email sign-in with an embedded wallet via Dynamic, so no seed phrases are needed to get started.
- Gasless trading: the matching engine relays a trader-signed authorisation on-chain.
- Mobile-first PWA with a TradingView Lightweight Charts price chart (line, with candlestick toggle, range and timeframe selection).
- Testnet faucet for test USDC.

## Design

I designed every screen in Figma: Home, Explore, Portfolio, Account (with faucet), basket detail with the trade chart, and the trade modal (Buy/Sell with 1x to 5x leverage). The design was converted to working frontend code and wired to the backend.

## Architecture

Five services in a monorepo (Python packages named `xleuth_*`):

| Service | Responsibility |
| --- | --- |
| `data-ingestion` | Pulls live market data and builds basket constituents |
| `oracle-service` | Reads index prices and pushes them on-chain with a backend-controlled signer key (MVP) |
| `backend-api` | REST and WebSocket API, accounts, portfolio reads, baskets (FastAPI) |
| `matching-engine` | Off-chain order book, margin checks, settlement submission |
| `contracts` | Foundry project with four contracts: `CollateralVault`, `PositionManager`, `IndexOracleConsumer`, `SettlementEngine` |

Plus a shared package (schemas, ABIs, constants) and API-contract docs (OpenAPI for both the API and the matching engine).

**Stack:** Python, FastAPI, SQLAlchemy, PostgreSQL / TimescaleDB, Redis, APScheduler, Docker Compose, Solidity, Foundry, Polygon (Amoy testnet), React + Vite (SPA), TradingView Lightweight Charts, Dynamic (auth and embedded wallets). Deployed on Vercel (frontend) and Render (backend services).

## The maths

- **Index pricing:** Bachelier digital-option pricing in log-odds space, `P(t) = N( L(t) / (σ√τ) )`, where `L(t)` is the log-odds level, `σ` the volatility and `τ` the time to resolution.
- **Resolution:** Each basket settles as a cash-or-nothing binary struck at $0.50. A dual-gate quorum must pass: a weighted-volume threshold and a minimum number of resolved markets.
- **Data ingestion:** Three endpoints: Gamma `/markets` for market metadata, CLOB for tick prices, Data API `/live-volume` for volume. Event-scoped volume deduplication is handled in an `event_map.py` module. Volume-only filtering is used, with special handling for umbrella markets that have date-bucketed conditions (only the condition matching a basket’s target month is selected).

## Key decisions and lessons

1. **Off-chain matching with on-chain settlement** instead of a vAMM or pool design, using Perpetual Protocol’s v1→v2 history as a cautionary precedent.
2. **A dated future, not a perpetual,** which removes funding-rate complexity and gives a clean settlement event.
3. **Found and fixed an ingestion bug:** the service queried `/events` instead of `/markets` on Polymarket’s Gamma API and undercounted basket constituents.
4. **Security hygiene:** found and patched real secrets leaking into `.env.example` files across service modules.
5. **Auth simplification:** replaced a custom SIWE/JWT flow with Dynamic’s JWT verified via JWKS on the backend, cutting custom auth code.
6. **Index administration:** moved basket definitions from a hard-coded environment variable (which broke when the month rolled over) to a database table with an admin CLI. New indexes require on-chain registration before they can be traded.
7. **Design-to-code without losing intent:** an early AI-agent frontend wiring attempt invented pages and broke working auth. The fix was a spec-first workflow: the designed frontend module is the scope ground truth, prompts are batched with context, and work stops at milestone checkpoints.

## Quality signals

- Matching engine: 45 unit tests plus 2 live integration tests on Polygon Amoy.
- Full API contract documented (OpenAPI for the API and the matching engine).
- Shipped end to end: design (Figma) → backend → frontend → deployed on a custom domain.

## How it was built

Most of the Solidity in Xleuth was **designed and specified by me, implemented with AI agents, reviewed by me**.
