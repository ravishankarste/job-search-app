# 🧠 Udyog Marg: Knowledge Log (Bug Fixes & Lessons Learned)

## [2026-05-02] - Production Stabilization & "Dominant" Routing
Resolved critical production deployment conflicts and launched the automated job intake engine.

### 🧭 1. Subdirectory Routing Fix
*   **The Conflict**: Hostinger's `/jobs/` subdirectory was colliding with the internal `/jobs` route, causing URL doubling (`/jobs/jobs`).
*   **The Solution**: Renamed the internal route to **`/pipeline`** in `src/router/index.tsx` and updated the `DashboardLayout.tsx` sidebar/breadcrumbs. Production URL is now clean: `upanita.com/jobs/pipeline`.

### 🤖 2. Universal Job Importer
*   **The Feature**: Added a "Magic Box" at the top of the Job Pipeline.
*   **How it works**: Users can paste any LinkedIn or Indeed job URL. The app performs an "Instant Parse" of the URL metadata and kicks off a "Sprint Scrape" (15s limit) to auto-fill job details, company, and location.

### 🛡️ 3. "Dominant Deployer" (GitHub Actions)
*   **Automation**: Rewrote `deploy.yml` to take full control of the Hostinger environment.
*   **Cleanup**: Added SSH commands to force-create the `/jobs/` directory and actively delete unwanted "ghost" folders (like `job-search-os`) created by legacy Git integrations.
*   **Strictness**: Cleaned up ~40 TypeScript unused-import errors to ensure a "Zero Tolerance" passing build in CI.

## [2026-05-02] - The "Smart Discovery" Evolution (Morning Session)
Complete architectural overhaul from manual tracking to an automated, intelligent "Job Search OS."

### 🧠 1. ATS Match Engine & Logic
*   **Core Service**: `src/features/jobs/services/matchAnalysisService.ts`
*   **How it works**: A hybrid rules-based engine that extracts keywords (React, Node, etc.) and professional roles (Engineer, Developer) to calculate a real-time compatibility score (0-100%).
*   **UI Components**: `MatchScoreBadge.tsx` (Grid view) and `MatchScoreWidget.tsx` (Detail view).

### 📄 2. PDF Intelligence Pipeline
*   **Core Service**: `src/features/resumes/services/pdfExtractionService.ts`
*   **Feature**: Integrated `pdfjs-dist` to perform 100% client-side text extraction.
*   **Automation**: Resume text is now automatically captured during the upload process in `resumeService.createResumeVersion` and stored in the `content` JSON column. This enables high-accuracy matching without external APIs.

### ✍️ 3. Content Drafting & Coaching
*   **Magic Cover Letter**: `src/features/jobs/services/coverLetterGeneratorService.ts`. Uses professional templates to inject matching skills found in the PDF.
*   **Interview Prep Mode**: `src/features/jobs/services/interviewPrepService.ts`. Generates 4 strategic questions (Strengths, Gaps, Behavioral) and a 30-second Elevator Pitch based on the job/resume delta.

### 🛡️ 4. Security Hardening
*   **Private Storage**: Switched from `getPublicUrl` to `createSignedUrl` in `resumeService.ts`. All resume PDFs are now private and accessible only via time-limited (1hr) tokens.
*   **Data Isolation**: Added explicit ownership checks in `getResumeVersions` to prevent cross-user data exposure.

### 🧪 5. Automated Testing Suite
*   **Framework**: Playwright (E2E).
*   **Test Specs**: `tests/e2e-journeys.spec.ts`. Covers Discovery, Match Scoring, and Interview Prep.
*   **Human Guide**: `TEST_JOURNEY.md`. A cheat-sheet for manual testers to experience the "Golden Journeys."

### 🐛 Bug Fix Log (Critical)
*   **Followup Service Recovery**: Fixed a critical crash where the original task-tracking logic was overwritten. Merged `getUpcomingTasks` and `createFollowup` with the new `isStale` ghosting detection logic in `followupService.ts`.
*   **Naming Standardization**: Standardized project-wide to `followupService.ts` (lowercase) to resolve case-sensitivity issues on deployment servers.

## [2026-05-04] - Migration to Upanita.app Root
Successfully migrated from Hostinger subdirectory `/jobs/` to the root of `upanita.app`.

### 🌐 1. Domain Migration
*   **The Move**: Updated `index.html`, `robots.txt`, and `sitemap.xml` to point to **`upanita.app`**.
*   **Vite Config**: Changed `base` from `/jobs/` to `/` in `vite.config.ts` to support root deployment.
*   **Router Basename**: Verified `src/router/index.tsx` uses `import.meta.env.BASE_URL`, which now correctly resolves to `/`.

### 🚀 2. Deployment Pipeline Update
*   **Dual Domain Sync**: Updated `.github/workflows/deploy.yml` to sync the production build to both `upanita.app` and the new `jobs.upanita.com` subdomain.
*   **Smart Redirect**: Implemented conditional logic in `public/.htaccess`. It detects if a user is accessing via the old `upanita.com/jobs/` subdirectory and redirects them to the new home, while allowing `jobs.upanita.com` and `upanita.app` to serve the app directly from the same folder.

### 🔐 3. Infrastructure & Identity
*   **SSH**: User confirmed Hostinger SSH and Git keys are re-established for the new environment.
*   **Google Auth**: Updated `authService.ts` and Supabase dashboard to allow root-level redirects from both domains.

## [2026-05-08] - Security Hardening & GTM Content Automation
**Objective**: Hardening the "Imperial Memory" and automating GTM precision.

### 🛡️ 1. The Deep Purge & Performance
*   **System Cleanup**: Eliminated **558 temporary visual logs** from the system brain to restore peak performance.
*   **Workspace Hygiene**: Executed a full cleanup of unnecessary screenshot artifacts while preserving all core brand assets.

### 🔐 2. Security Fortress Hardening
*   **Git Lockdown**: Hardened `.gitignore` for both Persona OS and Job Search OS.
*   **Secret Protection**: Explicitly blocked `.env` and `client_secret_*.json` from GitHub.
*   **Imperial Privacy**: Blocked `imperial_memory.json` from being tracked to protect founder's strategic data.
*   **Whitelisting**: Ensured `package.json` and `tsconfig.json` remain tracked for stable deployment.

### 🎯 3. GTM & Content Automation
*   **The Weaponization Loop**: Upgraded the Neural Sync engine to automatically draft LinkedIn hooks from recorded strategies/lessons.
*   **Growth Lab 2.0**: 
    *   **The Sniper Pillar**: Added high-conversion templates targeting Software Engineers (16% audience demographic).
    *   **Invisible SEO**: Integrated an Alt Text engine for LinkedIn algorithm optimization.
    *   **Content Rotation**: Implemented "Execute & Rotate" logic to prevent repetitive posting.

### 💡 4. Strategy & UX
*   **Activation Gap Fix**: Identified signup drop-off and implemented guided onboarding messages to walk users through the app.
*   **Unified Intelligence**: Merged live logs and static resources into a single "Command Vault" view.

## [2026-05-09] - Branding Sovereignty & Identity Hardening
**Objective**: Eliminating third-party branding from the login experience and hardening the Auth pipeline.

### 🛡️ 1. Branding Sovereignty (Google Identity Services)
*   **The Pivot**: Migrated from standard OAuth redirects to the **Native Google Identity Services (GIS) SDK**.
*   **Impact**: Resolved the "Continue to Supabase" branding issue. The login prompt now originates from the primary domain, showing the "Udyog Marg" app name and professional branding natively.
*   **One-Tap**: Enabled One-Tap sign-in for zero-friction returning user activation.

### 🔐 2. Auth Pipeline Hardening
*   **The Nonce Fix**: Resolved a critical `AuthApiError` (400 Bad Request) by implementing **JWT Nonce Extraction**.
*   **Technical Implementation**: Added logic to `authService.ts` to decode the Google ID Token (Base64Url) and extract the `nonce` claim, which is now passed back to Supabase for cryptographic validation.
*   **Import Resilience**: Restored missing React/Hook imports in `Login.tsx` and `Signup.tsx` after a tactical refactor.

### ⚙️ 3. Environment Integrity
*   **Newline Guard**: Fixed a critical `.env` corruption issue where keys were merged due to missing trailing newlines.
*   **Schema Update**: Updated `env.ts` (Zod validation) and `.env.example` to require `VITE_GOOGLE_CLIENT_ID`, ensuring system-wide stability.

## [2026-05-10] - Engineering Discipline & Scoring Transparency

### 🏛️ 1. The "Protocol Violation" Reset
*   **The Lesson**: Jumping directly to code without a confirmed Phase 1 Plan is a violation of the Sovereign Workflow.
*   **The Fix**: Implemented a **Development Manifesto** and performed a full code reset on the "Scoring Transparency" feature to demonstrate commitment to discipline.

### 💎 2. Scoring Transparency (The Sticky Feature)
*   **Objective**: Convert the "Black Box" ATS score into a Strategic Checklist.
*   **Implementation**: Added a clickable breakdown to `MatchScoreBadge`. Users can now see:
    *   **Assets Found**: Specific technical keywords matching the resume.
    *   **Impact Gaps**: Crucial missing requirements.
    *   **Reality Check**: Detection of seniority/experience mismatches.
*   **Architecture**: Built using `createPortal` for the modal to ensure Z-index integrity above the Pipeline Kanban.
