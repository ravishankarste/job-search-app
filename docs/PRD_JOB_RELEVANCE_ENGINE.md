# Product Requirements Document (PRD)
# Job Relevance Engine (Job Search App)

> Source: ChatGPT session — "Job Search Application - Search Relevance Engine"
> Saved: 2026-06-06

---

## 1. Product Overview

A job search application that removes browsing and replaces it with intent-based job decisions. Instead of showing large lists of jobs, the system returns a small set of highly relevant roles users can confidently apply to immediately.

---

## 2. Problem Statement

Traditional job platforms:
- show too many irrelevant jobs
- require repeated searching and filtering
- increase decision fatigue
- reduce trust in results

Users often:
- scroll endlessly
- re-search the same query multiple times
- compare across platforms (LinkedIn, Indeed)

---

## 3. Product Goal

Deliver: **"The top 3–10 jobs a user is most likely to apply for and succeed in."**

Key outcomes:
- reduce time to first meaningful application
- increase relevance confidence
- minimize search repetition

---

## 4. Core Principles

1. Fewer results, higher quality
2. Intent over keywords
3. Ranking over listing
4. Learning from user behavior silently
5. No dependency on a single job source

---

## 5. User Flow

### Step 1: Input
User enters: job role query (e.g. "junior backend developer london")

### Step 2: Intent Parsing
System extracts:
```json
{
  "role": "",
  "level": "",
  "skills": [],
  "location": "",
  "remote": true
}
```

### Step 3: Job Retrieval
Sources:
- **Adzuna API** (primary)
- Company career pages (secondary)
- Optional aggregators

Jobs are fetched on demand (not pre-stored at scale).

### Step 4: Normalization
All jobs converted into unified schema:
```json
{
  "title": "",
  "company": "",
  "location": "",
  "skills": [],
  "description": "",
  "postedDate": "",
  "source": ""
}
```

### Step 5: Ranking Engine
```
FinalScore =
  TitleMatch    × 5
+ SkillMatch    × 3
+ LocationMatch × 4
+ Recency       × 2
+ UserBehaviorBoost
```

### Step 6: Tiering System
- **Tier 1**: strict match (Top 3–5 jobs) ← primary UX
- **Tier 2**: good match (next 5–10) ← expand on demand
- **Tier 3**: weak match ← hidden by default

### Step 7: Output
Return top 3–10 jobs, grouped by tier, sorted by score.

---

## 6. Job Card Requirements

Each job card must display:
- Title
- Company
- Location
- Match label (Strong / Good / Weak)
- "Why this matches you" (2–3 bullet points)

Actions:
- Apply / Save
- Not relevant

No additional complexity.

---

## 7. Feedback Learning System

User behavior updates ranking:
- Apply → +5 boost to similar jobs
- Click + dwell → +2 boost
- Skip → -3 penalty

Caps applied to prevent instability.

---

## 8. Cold Start Strategy

For new users:
- rely purely on intent parsing
- strong filtering on role + location
- broad but controlled Tier 1 expansion

No personalization required initially.

---

## 9. Query Builder Logic

Intent → multiple queries:
- keyword-based queries (broad)
- API-filtered queries (precise)

Merge results → deduplicate → rank.

---

## 10. System Architecture

```
Frontend
→ Backend API
→ Intent Parser
→ Query Builder
→ Job Fetch Service
→ Normalizer
→ Ranking Engine
→ Feedback Layer
→ Response (Top N Jobs)
```

---

## 11. API Specification

**Request:**
```json
{
  "query": "",
  "location": "",
  "remote": true
}
```

**Response:**
```json
{
  "intent": {},
  "results": [
    {
      "title": "",
      "company": "",
      "score": 92,
      "tier": "Tier 1",
      "matchType": "strong",
      "skillsMatched": []
    }
  ]
}
```

---

## 12. Company Data Resolution

Priority:
1. API-provided website
2. Search lookup (company name + "official website")
3. Cached mapping

---

## 13. UX Requirements
- No long lists
- No heavy filters visible upfront
- Always show Tier 1 first
- Expand Tier 2 only if needed

---

## 14. Onboarding Requirement
- Single input field
- No login required initially
- Results shown within 30 seconds
- Immediate value delivery

---

## 15. Retention Model

User returns because:
- results update daily
- relevance improves with usage
- fewer searches required over time

---

## 16. Success Metrics
- Time to first application
- % of clicks from Tier 1
- Return usage within 7 days
- Search-to-apply ratio

---

## 17. Product Positioning

> "A job decision engine that shows only roles worth applying for."

---

## 18. Non-Goals (important)
- Not a full job marketplace
- Not a resume builder platform
- Not a social network
- Not a LinkedIn replacement
