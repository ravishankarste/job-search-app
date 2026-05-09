# Ubiquitous Language: Job Search OS (Udyog Marg)

This document establishes the formalized, shared vocabulary for the Job Search OS ecosystem. Use these terms strictly to ensure alignment between the Product Vision and Technical Implementation.

## 1. Core Product Terms

| Term | Definition | Context |
| :--- | :--- | :--- |
| **Udyog Marg** | The production brand name of the platform (Job Search OS). | Brand Identity |
| **Persona OS** | The local-only management shell and "Second Brain" for the founder. | Ecosystem |
| **Aha Moment** | The precise moment a user views their first Match Score. | Growth/Analytics |
| **The Pipeline** | The Kanban-style interface for tracking job application states. | Core Feature |
| **The Accelerator** | Onboarding components designed to bypass "Friction Walls." | UX Strategy |

## 2. Technical Intelligence Terms

| Term | Definition | Interface/Module |
| :--- | :--- | :--- |
| **Match Engine** | The algorithmic logic comparing Resumes to Job Descriptions. | `useMatchScore` |
| **Imperial Memory** | Local persistent knowledge storage in Persona OS. | `imperial_memory.json` |
| **Universal Importer** | The smart-scraping interface for LinkedIn/Indeed/etc. | `UniversalImporter.tsx` |
| **Growth Lab** | The content weaponization and GTM staging area. | `GrowthLab.tsx` |
| **Neural Search** | The intent-based local search engine in Persona OS. | `getFilteredKnowledge` |

## 3. System Architecture Mapping

### **Modules & Interfaces**
- **Auth Layer**: Supabase Auth (Identity Management).
- **Intelligence Layer**: PostHog (Event Tracking & Funnels).
- **Extraction Layer**: Apify (External Scraper Bridge).
- **Storage Layer**: Supabase DB (Cloud) & Local Storage/Files (Local Persona).

## 4. Usage Rules
1. **Strict Terminology**: Never refer to "The Pipeline" as "The Dashboard" or "The List."
2. **Contextual Precision**: When discussing "Imperial Memory," assume 100% privacy and local-only scope.
3. **The "Grill Me" Protocol**: Use this language to challenge design concepts before implementation.
