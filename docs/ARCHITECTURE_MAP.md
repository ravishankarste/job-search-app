# 🏗️ Udyog Marg: Full Spectrum Architecture Map

This document is the definitive "Single Source of Truth" and **Project GPS** for the Udyog Marg ecosystem. It ensures 100% navigation accuracy and architectural alignment for both human and AI agents.

## 🗺️ Project GPS (Directory Tree)

```text
job-search-app/
├── .github/                   # 🚀 Automation & CI/CD (Workflows)
├── .vscode/                   # ⚙️ Editor Configuration & Snippets
├── dist/                      # 📦 Compiled Production Build (Auto-generated)
├── docs/                      # 📜 Sovereign Knowledge Base & System Documentation
│   ├── ARCHITECTURE_MAP.md    # You are here (The Map)
│   ├── GTM_Strategy.md        # Growth & Acquisition Roadmap
│   ├── KnowledgeLog.md        # System Memory & Decision Journal
│   └── ... (Constitution, Roadmap, Identity)
├── node_modules/              # 📚 System Dependencies (External)
├── playwright-report/         # 📊 Automated Test Execution Reports
├── public/                    # 🌐 Static Assets & SEO Resources
│   ├── assets/                # Brand Logos & Landing Visuals
│   ├── favicons/              # System Tab Branding
│   ├── sitemap.xml            # SEO Road Map
│   └── robots.txt             # Crawler Instructions
├── scratch/                   # 🧪 Development Laboratory (One-off Scripts)
├── scripts/                   # 🛠️ Infrastructure & Devops Utilities (Supabase/DB)
├── src/                       # 🧠 The Core Engine (Udyog Marg Logic)
│   ├── components/            # 🧱 Atomic UI & Global Elements (common, onboarding)
│   ├── config/                # ⚙️ System Configuration & Environment Gateways
│   ├── contexts/              # 💠 React Contexts (Auth, UI State)
│   ├── features/              # ⚡ Modular Business Logic (Jobs, Auth, Analytics)
│   ├── hooks/                 # 🪝 Custom React Hooks (State Logic)
│   ├── layouts/               # 🏗️ Persistent UI Shells (Dashboard, Auth)
│   ├── lib/                   # 🛠️ Third-Party SDKs (Supabase, Analytics)
│   ├── pages/                 # 🖼️ Application Viewports (Landing, Dash, Settings)
│   ├── router/                # 🚦 Traffic Management & Protected Routes
│   ├── services/              # 🔌 API Abstraction & Business Services
│   ├── types/                 # 📝 Unified TypeScript Interfaces
│   ├── utils/                 # 🧰 Global Utility Functions
│   └── index.css              # 🎨 Core Design System & Tailwind Directives
├── supabase/                  # 🛡️ Backend Sovereign Data (Migrations/Config)
├── test-results/              # 🧪 Artifacts from Automated Test Failures
├── tests/                     # 🧪 E2E Quality Assurance (Playwright Scripts)
├── .antigravityignore         # 🛡️ AI Agent Instruction Filters
├── .env / .env.example        # 🔑 Environment Secrets & Templates
├── .gitignore                 # 🚫 Version Control Exclusion Rules
├── client_secret_*.json       # 🔐 Google OAuth Security Credentials
├── eslint.config.js           # 🧹 Code Quality & Linting Rules
├── index.html                 # 🖼️ Primary Mounting Surface
├── package-lock.json          # 🔒 Deterministic Dependency Lock
├── package.json               # ⚙️ System Dependencies & Scripts
├── playwright.config.ts       # 🎭 Test Runner Configuration
├── README.md                  # 📖 Project Overview & Quickstart
├── tsconfig.json / *.json     # 📝 TypeScript Control Protocols
├── udyog_marg_visual_identity_png.png # 🎨 Master Brand Signature
├── vercel.json                # 📐 Vercel Deployment Configuration
└── vite.config.ts             # 🚀 Build & Development Engine
```

---

## 📁 1. Assets & Public Boundary (`public/` & Root)
*   **`udyog_marg_visual_identity_png.png`**: The definitive brand visual signature.
*   **`index.html`**: The viewport and root mounting point for the application.
*   **`public/favicons/`**: Distinct brand identity icons for browser tabs.
*   **`README.md`**: The entry-level guide for system onboarding.

## 📁 2. System Configuration & Security (Root)
*   **`.env` / `.env.example`**: The gateway for system secrets and API keys.
*   **`client_secret_*.json`**: Security identity for Google Cloud & OAuth protocols.
*   **`.antigravityignore`**: Precise boundaries for AI agent autonomy.
*   **`eslint.config.js` / `tsconfig.json`**: Rulesets for code integrity and type safety.
*   **`vercel.json`**: Production hosting and serverless configuration.

## 📁 3. The Core Engine (`src/`)
*   **`App.tsx`**: The Central Command Center. Manages global layouts and route orchestration.
*   **`config/` / `services/`**: Logical abstraction layers for system configuration and API calls.
*   **`lib/`**: Direct integrations with external platforms (Supabase, PostHog).

## 📁 4. Modular Features (`src/features/`)
*   **`auth/`**: Identity & Session Management. Handles Google OAuth and Supabase Auth flows.
*   **`discovery/`**: The "Smart Discovery" engine. Scraper integrations for real-time job sourcing.
*   **`jobs/`**: The core Kanban pipeline, match scoring engine, and interview tracking.
*   **`resumes/`**: Profession identity vault. Handles versioning and skill extraction.
*   **`analytics/`**: Growth instrumentation. PostHog integration for funnel tracking.
*   **`applications/`**: Submission management. Tracks the lifecycle of active job bids.
*   **`notifications/`**: System-wide alerting and GTM pulse updates.

## 📁 5. Interface & UX (`src/pages/`, `src/components/` & `src/layouts/`)
*   **`pages/Dashboard.tsx`**: The Mission Control. High-level overview of the job search state.
*   **`pages/Analytics.tsx`**: Strategic performance metrics and success rates.
*   **`pages/landing/`**: High-conversion GTM entry points.
*   **`layouts/DashboardLayout.tsx`**: The premium glassmorphic shell for the application.
*   **`components/onboarding/`**: The "Zero-Friction" funnel driving user activation.
*   **`components/common/`**: Universal UI tokens (Buttons, Cards, Modals).
*   **`contexts/AuthContext.tsx`**: Global session distribution and security state.

## 📁 6. Database & DevOps (`supabase/`, `scripts/` & `tests/`)
*   **`supabase/migrations/`**: Versioned SQL blueprints for the database schema.
*   **`scripts/`**: Critical DevOps scripts for environment validation (Auth, Storage, DB).
*   **`tests/` / `playwright.config.ts`**: E2E test scripts and runner configuration.
*   **`playwright-report/`**: Visual evidence and logs from automated test runs.
