# Guide: Where Everything Is

This map shows you where to find everything in the Udyog Marg project.

## 🗺️ Project Map

```text
job-search-app/
├── .github/          # Automatic build and push rules
├── docs/             # Guides and project info
│   ├── rules/        # STEP-BY-STEP WORKFLOWS (The House Rules)
│   ├── tasks/        # History of what we've done
│   ├── ARCHITECTURE_MAP.md # This file (The Map)
│   ├── MASTER_ROADMAP.md   # Feature list and goals
│   └── LESSONS_LEARNED.md  # Things we learned the hard way
├── public/           # Images, logos, and icons
├── src/              # THE APP CODE (The Brain)
│   ├── components/   # Shared UI pieces (buttons, inputs)
│   ├── features/     # Main app tools (Jobs, Resumes, Auth)
│   ├── layouts/      # Main page shells
│   ├── pages/        # Individual screens (Landing, Dashboard)
│   ├── services/     # Tools for talking to the database
│   └── index.css     # Colors and styling rules
├── supabase/         # Database rules and updates
├── tests/            # Browser tests (Sanity Decathlon)
└── package.json      # List of tools and startup scripts
```

## 📁 1. The Rules (`docs/rules/`)
This is the most important folder. It contains the step-by-step checklists for:
- **Pushing Code**: How to safely update GitHub.
- **Building Features**: How to add new tools correctly.
- **Fixing Bugs**: How to troubleshoot safely.
- **Saving Data**: How to prevent data loss.
- **Database Changes**: How to update Supabase.
- **Email and Accounts**: Which email to use for which service.
- **Word Choices**: The simple words we use in the app.

## 📁 2. The App Code (`src/`)
- **`src/features/`**: This is where the main logic lives for Job Tracking, Resume Management, and AI Match Scoring.
- **`src/components/`**: This is where we keep the shared UI pieces like the "Margi" chat button and the "Exit Nudge."
- **`src/services/`**: These files handle all the communication with Supabase and Apify.

## 📁 3. Assets & Public (`public/`)
- **`public/assets/`**: Logos and images for the landing page.
- **`public/favicons/`**: The small icons you see in the browser tab.

## 📁 4. Backend (`supabase/`)
- **`supabase/migrations/`**: All the SQL scripts that have been run to build our database tables.

---

## 🧠 Lessons We Learned
1. **Build First**: Always run `npm run build` before pushing. It catches things that "Dev Mode" misses.
2. **Data Safety**: Never save data until you are 100% sure the initial load is finished.
3. **Simple English**: Users hate fancy words. Keep all buttons and labels simple.
4. **Automation IDs**: Every button needs a `data-testid` so we can test it automatically.
