# 🚀 Udyog Marg: Project Changelog

## [2026-05-02] - The "Smart Discovery" Evolution
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
