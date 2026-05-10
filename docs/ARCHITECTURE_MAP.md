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
│   ├── MASTER_ROADMAP.md      # Master Feature & Loop Tracker
│   ├── PROJECT_DICTIONARY.md   # The Dictionary (Core Vocabulary)
│   ├── DEVELOPMENT_MANIFESTO.md # The Laws of the Code (Workflow)
│   ├── KnowledgeLog.md        # System Memory & Decision Journal
│   └── ... (Constitution, Identity)
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
*   **`main.tsx`**: The entry point. Initializes React, Query Client, and Analytics.
*   **`router/index.tsx`**: The Traffic Controller. Manages all routes and protected boundaries.
*   **`config/`**: System-wide constants and environment variable validation (Zod).
*   **`services/`**: Global API abstraction layers (Auth, Pipeline, Resumes).
*   **`lib/`**: Direct integrations with external SDKs (Supabase, PostHog).
*   **`contexts/`**: Global state distribution (Auth, UI state).
*   **`hooks/`**: Custom React hooks for shared logic and data fetching.
*   **`types/`**: Unified TypeScript interfaces for the entire ecosystem.
*   **`utils/`**: Pure utility functions for formatting, validation, and math.

## 📁 4. Modular Features (`src/features/`)
*Each feature is a self-contained module with its own `pages/`, `components/`, `hooks/`, and `services/`.*

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

## 📁 6. Infrastructure & Build Tooling (Root)
*   **`package.json`**: System dependencies, scripts, and project metadata.
*   **`vite.config.ts`**: The build engine and dev server configuration.
*   **`playwright.config.ts`**: E2E test runner orchestration.
*   **`supabase/`**: Versioned database migrations and edge functions.
*   **`scripts/`**: DevOps utilities for DB validation and environment checks.
*   **`.github/workflows/`**: Automated CI/CD pipelines (Build & SSH Deploy).

---

## 🛡️ Subdomain Safeguards
To prevent "Deployment Collision," the root `job-search-app` deployment script is configured to **explicitly exclude** the following directories from its cleanup phase:
*   `/lab/` (The Innovation Lab)
*   `/runner/` (The Runner Launchpad)
*   `/jobs/` (Legacy Redirect Hub)

## 🧠 Lessons Learned (The Sovereign Pivot)
1.  **Automation Safety**: `rsync --delete` requires directory exclusions when subdomains are nested within the root `public_html`.
2.  **Secret Sovereignty**: Server-side secrets (e.g., `strava_secrets.php`) must be stored outside the `public_html` root to survive automated pushes.
3.  **Cross-Domain Pathing**: Navigation between subdomains requires absolute URL mapping to prevent 404s.
4.  **Database Lifecycle**: Supabase projects require active "heartbeats" to prevent 90-day inactivity pausing.
5.  **Branding Sovereignty**: Using Google Identity Services (Native SDK) instead of standard OAuth redirects removes "Continue to Supabase" branding for a premium UX.
6.  **OAuth Security (Nonce)**: Supabase's `signInWithIdToken` requires an exact match of the `nonce` claim extracted from the Google ID token JWT.
