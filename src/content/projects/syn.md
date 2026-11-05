---
slug: syn
order: 2
title: SYN
summary: A prediction market intelligence platform that identifies, evaluates and ranks potentially mispriced opportunities across Polymarket.
cardSummary: A prediction market intelligence platform that screens and ranks Polymarket opportunities
status: Deployed
role: Product Designer and Full-Stack Developer
dates: July 3, 2026
tags: [Product design, FinTech, Data analytics]
cover: syn-light.png
links:
  - { label: Live app, href: 'https://syn-v1-2-0.vercel.app/' }
diagram:
  description: Polymarket API feeds the FastAPI backend, which normalises, filters, scores and ranks opportunities with PostgreSQL and Redis. GET /opportunities delivers results to the React app.
  width: 720
  height: 540
  nodes:
    - { id: source, label: Polymarket API, detail: Metadata · prices · volume, x: 30, y: 30 }
    - { id: backend, label: FastAPI backend, detail: Normalise · filter · score · rank, x: 270, y: 30 }
    - { id: endpoint, label: GET /opportunities, detail: REST API, x: 510, y: 30 }
    - { id: database, label: PostgreSQL, detail: Relational storage, x: 150, y: 230 }
    - { id: cache, label: Redis, detail: Cache · low-latency operations, x: 390, y: 230 }
    - { id: app, label: React app, detail: Ranked opportunities, x: 510, y: 430 }
  edges:
    - { from: source, to: backend }
    - { from: database, to: backend }
    - { from: cache, to: backend }
    - { from: backend, to: endpoint }
    - { from: endpoint, to: app }
---

## Overview

SYN aggregates market data from Polymarket and applies a structured analytical framework to help users discover opportunities across binary YES/NO markets. Rather than manually browsing hundreds of markets and assessing each one independently, users get a single interface that organises market information, evaluates market conditions and ranks opportunities using configurable quantitative signals. It focuses on potentially attractive NO-side positions by analysing pricing, liquidity, trading volume and historical market accuracy.

> SYN is an analytical decision-support tool, not a trading bot. It does not execute trades or manage user funds. Its goal is to reduce the time and effort needed to discover and evaluate prediction market opportunities.

## The problem

Prediction market platforms expose a large, constantly changing set of markets, and finding mispriced ones means evaluating many variables by hand.

- **Information fragmentation:** relevant data is spread across many individual market pages.
- **Manual analysis:** users must compare prices, volume, liquidity and other indicators themselves.
- **Opportunity discovery:** attractive markets are hard to spot among hundreds.
- **Inconsistent evaluation:** without a framework, selection becomes subjective.
- **Time inefficiency:** monitoring and comparing markets by hand is overhead.

SYN consolidates the data into one analytical interface and applies one consistent scoring methodology.

## Core features

- **Market discovery and aggregation:** retrieves and organises Polymarket data and shows, per market: name and description, category, YES and NO prices, implied probabilities, liquidity, total volume, 24-hour volume, expiration date, time remaining, and a direct link to the original Polymarket market.
- **Quantitative opportunity scoring:** a weighted ranking engine.
- **NO-side analysis:** evaluates NO prices and applies configurable filters. Configured parameters: minimum NO price 0.50; minimum market volume 25,000; longshot price threshold 0.009; longshot inclusion disabled by default.
- **Filtering and ranking:** configurable criteria narrow the market universe, and the ranking engine combines the selected signals into one score that sets the relative priority of opportunities.
- **Expiration and time awareness:** expiration dates and remaining time help users tell markets with different resolution timelines apart.
- **Direct market navigation:** each opportunity links to its Polymarket market for further research before any decision.

## Technical architecture

A decoupled frontend/backend architecture. The frontend handles presentation and interaction. The backend retrieves, processes, filters and ranks market information.

| Layer | Technology | Responsibilities |
| --- | --- | --- |
| Frontend | React, Vite, TypeScript / JavaScript | Render ranked opportunities and market statistics, talk to the backend API, handle interactions and navigation |
| Backend | Python, FastAPI, REST | Retrieve external market data, normalise it, apply eligibility filters, calculate scores, rank qualifying markets, expose results through API endpoints |
| Database | PostgreSQL | Relational data storage |
| Cache | Redis | Caching and low-latency data operations |
| Integration | Polymarket API, REST | Market metadata, pricing, liquidity and volume (markets endpoint and live-volume data sources) |
| Frontend hosting | Vercel | |
| Backend hosting | Render (API, PostgreSQL and Redis) | |
| Version control | Git, GitHub | |

Environment-based configuration manages deployment-specific settings such as the frontend API endpoint, and CORS is configured so the deployed frontend and backend can communicate.

## Ranking and evaluation methodology

A weighted score prioritises markets on three signals:

| Signal | Weight | What it captures |
| --- | --- | --- |
| Trading volume | 40% | Participation and activity. Higher-volume markets get greater consideration. |
| NO-side market price | 35% | The core pricing signal when comparing opportunities. |
| Historical accuracy | 25% | An empirical dimension that separates the framework from one based only on current pricing and activity. |

The purpose is a repeatable evaluation process instead of purely subjective market selection.

> **The score is a screening mechanism, not a guarantee of profitability or a calibrated probability of success.**

## API design

The market intelligence functionality is exposed through a REST API. The main endpoint is `GET /opportunities`, which returns processed, ranked opportunities to the frontend. Separating data processing from presentation lets the analytical engine and the interface evolve independently. The endpoint was verified in development and returned a dataset of hundreds of qualifying market records during testing.

## Engineering challenges

- **External API integration:** turning prediction market data from external endpoints into a consistent internal representation.
- **Data normalisation:** making prices, volumes, liquidity and expiration data processable consistently.
- **Scoring methodology:** translating several evaluation signals into one weighted ranking.
- **Backend/frontend separation:** designing a REST API that separates analysis from presentation.
- **Deployment configuration:** managing independently deployed services and resolving cross-origin communication.
- **Data reliability:** accounting for changing market data and the gap between displayed data and underlying market conditions.

## Product direction

SYN aims to make prediction market research more systematic and accessible. The first version focuses on binary YES/NO opportunity discovery and quantitative screening. The architecture is a base for more evaluation signals, historical performance analysis, more sophisticated filtering and wider prediction market coverage.

## Outcome

SYN went from a product concept to a deployed web application with a working frontend/backend architecture. The work covered: designing the product, building the React frontend, building the Python/FastAPI backend, integrating external market data, implementing the weighted ranking framework, exposing results through REST endpoints, deploying on Vercel and Render, and configuring the database, cache and cross-origin setup.

SYN demonstrates the application of full-stack engineering, financial data processing, and quantitative evaluation methodologies to a real-world prediction market use case.
