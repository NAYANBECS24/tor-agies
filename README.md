# TOR Sentinel 2.0 — Dark Web Threat Intelligence & Tor Network Monitoring Platform

[![Version](https://img.shields.io/badge/version-2.0.0-blue)](https://github.com/NAYANBECS24/tor-sentinel)
[![Node](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> **TOR Sentinel 2.0** is an advanced dark web threat intelligence and Tor network monitoring platform. It aggregates live Tor relay data via Onionoo, performs deep de-anonymization analysis on threat actors, runs SOC-aligned detection workflows, and delivers immersive real-time cybersecurity analytics through a modern React dashboard.

---

## 📌 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Install](#quick-install)
  - [Run Locally](#run-locally)
  - [Docker (Recommended)](#docker-recommended)
- [🔌 API Overview](#-api-overview)
- [🧠 Core Intelligence Modules](#-core-intelligence-modules)
- [🔐 SOC & Compliance](#-soc--compliance)
- [🖥 Frontend Dashboard](#-frontend-dashboard)
- [🧪 Testing](#-testing)
- [⚙️ Configuration & Environment](#️-configuration--environment)
- [🛡 Security Notes](#-security-notes)
- [📜 License](#-license)
- [🤝 Contributing](#-contributing)

---

## ✨ Features

### Network & Traffic Intelligence
- **Live Tor Network Monitoring** — near real-time relay/node metrics streamed from Onionoo.
- **Traffic Analytics Dashboard** — protocol breakdown, geo-distribution, bandwidth, uptime and threat blocking visualizations.
- **Real-Time WebSocket/Socket.IO Updates** — live dashboards that refresh without page reloads.

### Dark Web Threat Intelligence
- **Hidden Service Scanner** — audits `.onion` services for misconfigurations and clearnet leaks.
- **Actor Identity Graph** — builds cross-alias link graphs to connect threat-actor identities.
- **Stylometry Engine** — authorship fingerprinting and reverse stylometry (AI-evasion detection).
- **Dossier Export** — generates structured intelligence dossiers for investigations.
- **Behavioral Profiler** — profile actor behaviour patterns and operating hours.
- **Blockchain Tracer** — trace payment/wallet trails linked to threat actors.
- **Autonomous Crawler** — automated dark web crawl workflows.
- **Evidence Chain Builder** — forensically auditable evidence chains.

### Project A.E.G.I.S. — 3-Layer De-Anonymization Engine
A state-level unified threat attribution engine:

| Layer | Name | Capability |
|-------|------|------------|
| **1** | Ghost-Server | JA3 TLS-handshake fingerprinting + Favicon MMH3 (Shodan-style) attribution |
| **2** | Crypto Time-Travel | PGP metadata forensics + Git API + alias predictor |
| **3** | Persona DNA | Circadian chrono-location + 768-dim behavioral vector modeling |

Plus **AI-Evasion Detection** and **Tarpit/Honeypot** analysis.

### SOC Integration (RFT 26/2026 Co-Managed SOC Standard)
- SIEM ingestion layer
- MITRE ATT&CK detection engineering
- Threat intelligence and threat hunting workflows
- Time integrity, audit trail and data retention services
- SOC compliance reporting

### Advanced Analytics
- **Correlation Engine** — link events, actors and indicators across the platform.
- **Adaptive ATWC Network-State Estimator** — self-tuning threat / network-state modeling.
- **Federated ATWC Engine** — privacy-preserving federated training across ISP instances.
- **Case Management & Intelligence Reports** — full investigation lifecycle support.

---

## 🛠 Tech Stack

### Backend
- **Node.js** (Express) — REST API + Socket.IO real-time server
- **SQLite** (`better-sqlite3`) — zero-config, file-based persistence
- **WS / Socket.IO** — real-time bidirectional streaming
- **Helmet, CORS, express-rate-limit** — hardened HTTP middleware
- **Winston** — structured logging

### Frontend
- **React 18** + **React Router** (SPA)
- **Material UI (MUI)** — design system
- **Redux Toolkit** — state management
- **Chart.js / Recharts / react-force-graph / Three.js** — data visualizations
- **Leaflet (react-leaflet)** — mapping / network topology
- **Socket.IO-Client** — live updates
- **Framer Motion** — animations

### Infrastructure
- **Docker Compose** — orchestration (backend, frontend, MongoDB, Redis)
- **Nginx** — production reverse proxy & static serving

---

## 📁 Project Structure

```
tor-sentinel/
├── backend/                      # Node.js API server
│   ├── src/
│   │   ├── config/               # DB & Redis configuration
│   │   ├── controllers/          # Request handlers
│   │   ├── middleware/           # Auth, validation, error handling
│   │   ├── models/               # SQLite/ODM models
│   │   ├── routes/               # REST route definitions
│   │   ├── scripts/              # Seed & test scripts
│   │   ├── services/             # Core business logic & engines
│   │   └── utils/                # Loggers & helpers
│   ├── data/                     # SQLite database files
│   └── Dockerfile
│
├── frontend/                     # React SPA dashboard
│   ├── src/
│   │   ├── api/                  # API client & service wrappers
│   │   ├── app/                  # Redux store setup
│   │   ├── components/           # Reusable UI components
│   │   ├── features/             # Redux slices (auth, alerts, tor, analytics)
│   │   ├── pages/                # Route pages & views
│   │   └── utils/                # Helpers, notifications, websocket client
│   ├── public/
│   ├── build/                    # Production build output
│   ├── nginx.conf                # Nginx reverse proxy config
│   └── Dockerfile
│
├── docker-compose.yml            # Multi-service orchestration
├── server.js                     # Standalone demo traffic-analyzer server
├── package.json                  # Root demo backend manifest
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and **npm**
- **Docker** & **Docker Compose** (for the containerized path)
- (Optional) MongoDB & Redis for the legacy compose setup

### Quick Install

```bash
# 1. Clone the repository
git clone https://github.com/NAYANBECS24/tor-sentinel.git
cd tor-sentinel

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Configure environment (see Configuration section)
#    Copy the sample env files and edit as needed.
```

### Run Locally

**Start the backend:**
```bash
cd backend
npm run dev          # dev mode with nodemon
# or
npm start            # production mode
# Backend runs at http://localhost:5000
```

**Start the frontend:**
```bash
cd frontend
npm start
# Frontend runs at http://localhost:3000
```

**Standalone demo traffic analyzer (optional):**
```bash
# From the project root
npm install
npm start
# Live WebSocket traffic dashboard at http://localhost:5000
```

### Docker (Recommended)

```bash
# Spin up the full stack (backend, frontend, MongoDB, Redis)
docker-compose up --build

# Frontend:        http://localhost:3000
# Backend API:     http://localhost:5000
# MongoDB:         localhost:27017
# Redis:           localhost:6379
```

---

## 🔌 API Overview

The backend exposes several REST + WebSocket surfaces:

| Area | Base Path | Description |
|------|-----------|-------------|
| Health & Test | `/health`, `/api/test`, `/api` | Service status & metadata |
| Dark Web Intel | `/api/darkweb` | Hidden service scans, actor graph, stylometry, dossiers |
| Next-Level Intel | `/api/v2` | Blockchain, behavioral, OSINT, timeline, evidence chain |
| Case Management | `/api/cases` | Investigation cases & correlation |
| Project A.E.G.I.S. | `/api/aegis` | 3-layer de-anonymization engine |
| Tor Network | `/api/tor`, `/tor`, `/api/nodes` | Onionoo relay data, metrics, ATWC, federation, SOC compliance |
| SOC Layer | `/api/soc`, `/soc` | SIEM, MITRE, threat hunting, audit, retention |
| Real-Time | Socket.IO (`/socket.io`) | Live subscription channels |

**Quick sanity checks:**
```bash
curl http://localhost:5000/health
curl http://localhost:5000/api/test
curl http://localhost:5000/api/tor/overview
curl http://localhost:5000/api/tor/onionoo/live
```

---

## 🧠 Core Intelligence Modules

| Module | Endpoint | Purpose |
|--------|----------|---------|
| Hidden Service Scanner | `POST /api/darkweb/scan` | Audit `.onion` service misconfigurations & leaks |
| Actor Identity Graph | `/api/darkweb/actor-graph` | Cross-alias link graph of threat actors |
| Stylometry Engine | `/api/darkweb/stylometry` | Authorship fingerprinting & AI-evasion detection |
| Dossier Export | `/api/darkweb/dossier` | Structured intelligence dossiers |
| Behavioral Profiler | `/api/v2/behavioral` | Actor behaviour & operating-hour profiling |
| Blockchain Tracer | `/api/v2/blockchain` | Wallet/payment trail tracing |
| Evidence Chain | `/api/v2/evidence` | Forensically auditable evidence chains |
| Timeline Query | `/api/v2/timeline` | Event timeline reconstruction |
| A.E.G.I.S. Master | `POST /api/aegis/investigate` | Full 3-layer attribution pipeline |

---

## 🔐 SOC & Compliance

The platform ships with an operational SOC integration layer aligned to **RFT 26/2026 Co-Managed SOC Standard**:

- **SIEM Ingestion** — structured event ingestion for enterprise SIEM tools
- **MITRE ATT&CK** — detection engineering mapped to ATT&CK techniques
- **Threat Hunting** — proactive hunting playbooks & services
- **Threat Intel** — aggregated external + platform threat intelligence
- **Time Integrity** — NTP/audit time-sync guarantees
- **Audit & Retention** — compliance-grade audit trail and data retention

---

## 🖥 Frontend Dashboard

The dashboard is a fully responsive, dark-theme SPA with modules for:

- **Real-Time Monitor** — live network and threat feeds
- **Traffic & Analytics** — bandwidth, protocol, geo and device breakdowns
- **Alerts** — severity-based alert triage with detail views
- **Network Map** — geographical / topology visualization
- **Tor Nodes** — relay/node inspection and search
- **Pattern Recognition & AI Predictions** — ML-style analytics (via PatternRecognition & ai pages)
- **Intel Report, Correlation Matrix, Case Management** — investigation workspace
- **Dark Web Tools** — scanner, actor graph, stylometry, dossier, blockchain, evidence chain
- **Project A.E.G.I.S.** — the unified de-anonymization engine UI

The frontend proxies API requests to the backend and connects over Socket.IO for live updates.

---

## 🧪 Testing

```bash
# Backend tests (Jest + Supertest)
cd backend
npm test

# Backend scripted smoke tests
node src/scripts/test_onionoo_audit.js
node src/scripts/test_report_system.js
node src/scripts/test_soc_compliance.js
```

---

## ⚙️ Configuration & Environment

Both services read configuration from `.env` files at their respective roots.

### Backend (`backend/.env`)
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
API_RATE_LIMIT_WINDOW=15
API_RATE_LIMIT_MAX=100
TOR_METRICS_API=https://metrics.torproject.org
MASTER_ENCRYPTION_KEY=your_64_character_hex_key_here
FEDERATION_ENABLED=true
FEDERATION_ENDPOINTS=http://other-instance1:5000,http://other-instance2:5000
NODE_ID=tor-sentinel-1
```

### Frontend (`frontend/.env`)
```env
REACT_APP_WS_URL=ws://localhost:5000
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENCRYPTION_KEY=frontend_encryption_key
```

> **Note:** Never commit real secrets. The `.env` files are git-ignored — provide your own values in production.

---

## 🛡 Security Notes

- **JWT-authenticated** API with `helmet` hardening and rate limiting.
- **Encryption layer** (`encryptionManager`) with a master key for sensitive telemetry.
- **Federation** endpoints support secure key-signed exchanges between instances.
- **Health/Test** endpoints are exposed for operational checks — restrict public access in production.
- Always rotate `JWT_SECRET`, `MASTER_ENCRYPTION_KEY` and federation keys before a public deployment.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome. Feel free to check the [issues page](https://github.com/NAYANBECS24/tor-sentinel/issues).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with security and intelligence in mind.** Stay ahead of the threat surface.
