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
*   **Workflow**: Updated `.github/workflows/deploy.yml` to target `domains/upanita.app/public_html/`.
*   **Automated Redirect**: Added a 301 redirect step to the pipeline. It automatically configures an `.htaccess` on the old `upanita.com/jobs/` path to point all traffic to the new domain, ensuring zero link breakage.

### 🔐 3. Infrastructure & Identity
*   **SSH**: User confirmed Hostinger SSH and Git keys are re-established for the new environment.
