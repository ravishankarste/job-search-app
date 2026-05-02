# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-journeys.spec.ts >> Udyog Marg - Golden Journeys >> Journey 3: Interview Coaching
- Location: tests/e2e-journeys.spec.ts:73:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e6]:
      - img [ref=e8]
      - heading "Udyog Marg" [level=2] [ref=e12]
    - navigation [ref=e13]:
      - link "Dashboard" [ref=e14] [cursor=pointer]:
        - /url: /dashboard
        - img [ref=e15]
        - text: Dashboard
      - link "Discovery" [ref=e20] [cursor=pointer]:
        - /url: /discovery
        - img [ref=e21]
        - text: Discovery
      - link "Job Pipeline" [ref=e24] [cursor=pointer]:
        - /url: /jobs
        - img [ref=e25]
        - text: Job Pipeline
      - link "Resumes" [ref=e28] [cursor=pointer]:
        - /url: /resumes
        - img [ref=e29]
        - text: Resumes
      - link "Analytics" [ref=e32] [cursor=pointer]:
        - /url: /analytics
        - img [ref=e33]
        - text: Analytics
      - link "Settings" [ref=e35] [cursor=pointer]:
        - /url: /settings
        - img [ref=e36]
        - text: Settings
    - generic [ref=e39]:
      - generic [ref=e40]:
        - generic [ref=e41]: R
        - generic [ref=e42]:
          - paragraph [ref=e43]: Ravi
          - paragraph [ref=e44]: Premium Account
      - button "Logout" [ref=e45]:
        - img [ref=e46]
        - text: Logout
  - main [ref=e49]:
    - generic [ref=e50]:
      - generic [ref=e52]:
        - link "Home" [ref=e53] [cursor=pointer]:
          - /url: /dashboard
        - img [ref=e54]
        - generic [ref=e56]: jobs
      - generic [ref=e57]:
        - generic [ref=e58]:
          - textbox "Quick search..." [ref=e59]
          - img
        - button [ref=e60]:
          - img [ref=e61]
    - generic [ref=e66]:
      - generic [ref=e67]:
        - generic [ref=e68]:
          - generic [ref=e71]: Application Workflow
          - heading "Job Pipeline" [level=1] [ref=e72]
        - generic [ref=e73]:
          - generic [ref=e74]:
            - textbox "Filter by title or company..." [ref=e75]
            - img
          - button "Add Application" [ref=e76]:
            - img [ref=e77]
            - text: Add Application
      - generic [ref=e79]:
        - img [ref=e82]
        - generic [ref=e85]:
          - heading "Universal Job Importer" [level=3] [ref=e86]
          - paragraph [ref=e87]: Found a job on LinkedIn or Indeed? Paste the URL below to auto-import it.
        - generic [ref=e88]:
          - textbox "https://www.linkedin.com/jobs/view/..." [active] [ref=e90]
          - button "Import" [disabled] [ref=e91]
      - generic [ref=e92]:
        - button "saved 15" [ref=e93]:
          - generic [ref=e94]: saved
          - generic [ref=e95]: "15"
        - button "applied 1" [ref=e96]:
          - generic [ref=e97]: applied
          - generic [ref=e98]: "1"
        - button "interviewing 1" [ref=e99]:
          - generic [ref=e100]: interviewing
          - generic [ref=e101]: "1"
        - button "offered 0" [ref=e102]:
          - generic [ref=e103]: offered
          - generic [ref=e104]: "0"
        - button "rejected 0" [ref=e105]:
          - generic [ref=e107]: rejected
          - generic [ref=e108]: "0"
          - img [ref=e109]
      - generic [ref=e111]:
        - generic [ref=e112]:
          - generic [ref=e114]:
            - heading "saved" [level=3] [ref=e116]
            - generic [ref=e117]: "15"
          - generic [ref=e118]:
            - generic [ref=e119] [cursor=pointer]:
              - generic [ref=e120]:
                - img [ref=e122]
                - generic [ref=e126]:
                  - generic [ref=e127]:
                    - img [ref=e128]
                    - generic [ref=e132]: 0%
                  - link "Open Original Job Posting" [ref=e133]:
                    - /url: https://www.linkedin.com/jobs/collections/recommended/?currentJobId=4393908021
                    - img [ref=e134]
              - generic [ref=e138]:
                - heading "Import Failed (Manual Action Required)" [level=4] [ref=e139]
                - paragraph [ref=e140]: Checking...
              - generic [ref=e141]:
                - generic [ref=e142]:
                  - img [ref=e143]
                  - text: Remote
                - img [ref=e147]
            - generic [ref=e149] [cursor=pointer]:
              - generic [ref=e150]:
                - img [ref=e152]
                - generic [ref=e156]:
                  - generic [ref=e157]:
                    - img [ref=e158]
                    - generic [ref=e162]: 25%
                  - link "Open Original Job Posting" [ref=e163]:
                    - /url: https://in.linkedin.com/jobs/view/react-js-developer-at-infosys-4393032766
                    - img [ref=e164]
              - generic [ref=e168]:
                - heading "React JS Developer" [level=4] [ref=e169]
                - paragraph [ref=e170]: Infosys
              - generic [ref=e171]:
                - generic [ref=e172]:
                  - img [ref=e173]
                  - text: Hyderabad, Telangana, India
                - img [ref=e177]
            - generic [ref=e179] [cursor=pointer]:
              - generic [ref=e180]:
                - img [ref=e182]
                - generic [ref=e186]:
                  - generic [ref=e187]:
                    - img [ref=e188]
                    - generic [ref=e192]: 14%
                  - link "Open Original Job Posting" [ref=e193]:
                    - /url: https://id.linkedin.com/jobs/view/front-end-developer-at-moc-group-4407894414
                    - img [ref=e194]
              - generic [ref=e198]:
                - heading "Front-end Developer" [level=4] [ref=e199]
                - paragraph [ref=e200]: MOC Group
              - generic [ref=e201]:
                - generic [ref=e202]:
                  - img [ref=e203]
                  - text: Kelapa Gading, Jakarta, Indonesia
                - img [ref=e207]
            - generic [ref=e209] [cursor=pointer]:
              - generic [ref=e210]:
                - img [ref=e212]
                - generic [ref=e216]:
                  - generic [ref=e217]:
                    - img [ref=e218]
                    - generic [ref=e222]: 40%
                  - link "Open Original Job Posting" [ref=e223]:
                    - /url: https://eg.linkedin.com/jobs/view/junior-frontend-developer-at-coca-cola-hbc-4408246396
                    - img [ref=e224]
              - generic [ref=e228]:
                - heading "Junior Frontend Developer" [level=4] [ref=e229]
                - paragraph [ref=e230]: Coca-Cola HBC
              - generic [ref=e231]:
                - generic [ref=e232]:
                  - img [ref=e233]
                  - text: Cairo, Egypt
                - img [ref=e237]
            - generic [ref=e239] [cursor=pointer]:
              - generic [ref=e240]:
                - img [ref=e242]
                - generic [ref=e246]:
                  - generic [ref=e247]:
                    - img [ref=e248]
                    - generic [ref=e252]: 35%
                  - link "Open Original Job Posting" [ref=e253]:
                    - /url: https://in.linkedin.com/jobs/view/reactjs-developer-at-tata-elxsi-4402103782
                    - img [ref=e254]
              - generic [ref=e258]:
                - heading "ReactJS Developer" [level=4] [ref=e259]
                - paragraph [ref=e260]: Tata Elxsi
              - generic [ref=e261]:
                - generic [ref=e262]:
                  - img [ref=e263]
                  - text: Pune City, Maharashtra, India
                - img [ref=e267]
            - generic [ref=e269] [cursor=pointer]:
              - generic [ref=e270]:
                - img [ref=e272]
                - generic [ref=e276]:
                  - generic [ref=e277]:
                    - img [ref=e278]
                    - generic [ref=e282]: 25%
                  - link "Open Original Job Posting" [ref=e283]:
                    - /url: https://id.linkedin.com/jobs/view/frontend-developer-at-indico-by-telkomsel-4408212274
                    - img [ref=e284]
              - generic [ref=e288]:
                - heading "Frontend Developer" [level=4] [ref=e289]
                - paragraph [ref=e290]: INDICO by Telkomsel
              - generic [ref=e291]:
                - generic [ref=e292]:
                  - img [ref=e293]
                  - text: Jakarta, Jakarta, Indonesia
                - img [ref=e297]
            - generic [ref=e299] [cursor=pointer]:
              - generic [ref=e300]:
                - img [ref=e302]
                - generic [ref=e306]:
                  - generic [ref=e307]:
                    - img [ref=e308]
                    - generic [ref=e312]: 45%
                  - link "Open Original Job Posting" [ref=e313]:
                    - /url: https://uk.linkedin.com/jobs/view/frontend-engineer-at-heycar-4340632549
                    - img [ref=e314]
              - generic [ref=e318]:
                - heading "Frontend Engineer" [level=4] [ref=e319]
                - paragraph [ref=e320]: heycar
              - generic [ref=e321]:
                - generic [ref=e322]:
                  - img [ref=e323]
                  - text: London, England, United Kingdom
                - img [ref=e327]
            - generic [ref=e329] [cursor=pointer]:
              - generic [ref=e330]:
                - img [ref=e332]
                - generic [ref=e336]:
                  - generic [ref=e337]:
                    - img [ref=e338]
                    - generic [ref=e342]: 38%
                  - link "Open Original Job Posting" [ref=e343]:
                    - /url: https://uk.linkedin.com/jobs/view/frontend-developer-at-tain-4401461493
                    - img [ref=e344]
              - generic [ref=e348]:
                - heading "Frontend Developer" [level=4] [ref=e349]
                - paragraph [ref=e350]: Tain
              - generic [ref=e351]:
                - generic [ref=e352]:
                  - img [ref=e353]
                  - text: London, England, United Kingdom
                - img [ref=e357]
            - generic [ref=e359] [cursor=pointer]:
              - generic [ref=e360]:
                - img [ref=e362]
                - generic [ref=e366]:
                  - generic [ref=e367]:
                    - img [ref=e368]
                    - generic [ref=e372]: 17%
                  - link "Open Original Job Posting" [ref=e373]:
                    - /url: https://uk.linkedin.com/jobs/view/front-end-developer-at-dexory-4408288402
                    - img [ref=e374]
              - generic [ref=e378]:
                - heading "Front End Developer" [level=4] [ref=e379]
                - paragraph [ref=e380]: Dexory
              - generic [ref=e381]:
                - generic [ref=e382]:
                  - img [ref=e383]
                  - text: London, England, United Kingdom
                - img [ref=e387]
            - generic [ref=e389] [cursor=pointer]:
              - generic [ref=e390]:
                - img [ref=e392]
                - generic [ref=e396]:
                  - generic [ref=e397]:
                    - img [ref=e398]
                    - generic [ref=e402]: 40%
                  - link "Open Original Job Posting" [ref=e403]:
                    - /url: https://uk.linkedin.com/jobs/view/front-end-engineer-at-zavo-4363795818
                    - img [ref=e404]
              - generic [ref=e408]:
                - heading "Front-End Engineer" [level=4] [ref=e409]
                - paragraph [ref=e410]: Zavo
              - generic [ref=e411]:
                - generic [ref=e412]:
                  - img [ref=e413]
                  - text: London, England, United Kingdom
                - img [ref=e417]
            - generic [ref=e419] [cursor=pointer]:
              - generic [ref=e420]:
                - img [ref=e422]
                - generic [ref=e426]:
                  - generic [ref=e427]:
                    - img [ref=e428]
                    - generic [ref=e432]: 25%
                  - link "Open Original Job Posting" [ref=e433]:
                    - /url: https://uk.linkedin.com/jobs/view/frontend-developer-at-humaniq-4281481971
                    - img [ref=e434]
              - generic [ref=e438]:
                - heading "Frontend developer" [level=4] [ref=e439]
                - paragraph [ref=e440]: Humaniq
              - generic [ref=e441]:
                - generic [ref=e442]:
                  - img [ref=e443]
                  - text: London, England, United Kingdom
                - img [ref=e447]
            - generic [ref=e449] [cursor=pointer]:
              - generic [ref=e450]:
                - img [ref=e452]
                - generic [ref=e456]:
                  - generic [ref=e457]:
                    - img [ref=e458]
                    - generic [ref=e462]: 40%
                  - link "Open Original Job Posting" [ref=e463]:
                    - /url: https://uk.linkedin.com/jobs/view/front-end-engineer-at-nsave-4406547307
                    - img [ref=e464]
              - generic [ref=e468]:
                - heading "Front-End Engineer" [level=4] [ref=e469]
                - paragraph [ref=e470]: nsave
              - generic [ref=e471]:
                - generic [ref=e472]:
                  - img [ref=e473]
                  - text: London, England, United Kingdom
                - img [ref=e477]
            - generic [ref=e479] [cursor=pointer]:
              - generic [ref=e480]:
                - img [ref=e482]
                - generic [ref=e486]:
                  - generic [ref=e487]:
                    - img [ref=e488]
                    - generic [ref=e492]: 40%
                  - link "Open Original Job Posting" [ref=e493]:
                    - /url: https://indeed.com/viewjob?jk=2
                    - img [ref=e494]
              - generic [ref=e498]:
                - heading "Frontend Engineer (React/TypeScript)" [level=4] [ref=e499]
                - paragraph [ref=e500]: Innovate AI
              - generic [ref=e501]:
                - generic [ref=e502]:
                  - img [ref=e503]
                  - text: New York, NY
                - img [ref=e507]
            - generic [ref=e509] [cursor=pointer]:
              - generic [ref=e510]:
                - img [ref=e512]
                - generic [ref=e516]:
                  - generic [ref=e517]:
                    - img [ref=e518]
                    - generic [ref=e522]: 0%
                  - link "Open Original Job Posting" [ref=e523]:
                    - /url: https://linkedin.com/jobs/view/1
                    - img [ref=e524]
              - generic [ref=e528]:
                - heading "Senior React Developer" [level=4] [ref=e529]
                - paragraph [ref=e530]: TechFlow Solutions
              - generic [ref=e531]:
                - generic [ref=e532]:
                  - img [ref=e533]
                  - text: Remote
                - img [ref=e537]
            - generic [ref=e539] [cursor=pointer]:
              - generic [ref=e540]:
                - img [ref=e542]
                - generic [ref=e546]:
                  - generic [ref=e547]:
                    - img [ref=e548]
                    - generic [ref=e552]: 31%
                  - link "Open Original Job Posting" [ref=e553]:
                    - /url: https://google.com
                    - img [ref=e554]
              - generic [ref=e558]:
                - heading "Senior frontend engineer" [level=4] [ref=e559]
                - paragraph [ref=e560]: Google
              - generic [ref=e561]:
                - generic [ref=e562]:
                  - img [ref=e563]
                  - text: Remote
                - img [ref=e567]
        - generic [ref=e569]:
          - generic [ref=e571]:
            - heading "applied" [level=3] [ref=e573]
            - generic [ref=e574]: "1"
          - generic [ref=e576] [cursor=pointer]:
            - generic [ref=e577]:
              - img [ref=e579]
              - generic [ref=e583]:
                - generic [ref=e584]:
                  - img [ref=e585]
                  - generic [ref=e589]: 33%
                - link "Open Original Job Posting" [ref=e590]:
                  - /url: https://stripe.com
                  - img [ref=e591]
            - generic [ref=e595]:
              - heading "Senior Backend Engineer" [level=4] [ref=e596]
              - paragraph [ref=e597]: Stripe
            - generic [ref=e598]:
              - generic [ref=e599]:
                - img [ref=e600]
                - text: Remote
              - img [ref=e604]
        - generic [ref=e606]:
          - generic [ref=e608]:
            - heading "interviewing" [level=3] [ref=e610]
            - generic [ref=e611]: "1"
          - generic [ref=e613] [cursor=pointer]:
            - generic [ref=e614]:
              - img [ref=e616]
              - generic [ref=e620]:
                - generic [ref=e621]:
                  - img [ref=e622]
                  - generic [ref=e626]: 17%
                - link "Open Original Job Posting" [ref=e627]:
                  - /url: https://linkedin.com/jobs/view/3
                  - img [ref=e628]
            - generic [ref=e632]:
              - heading "Full Stack Engineer" [level=4] [ref=e633]
              - paragraph [ref=e634]: Global Fintech
            - generic [ref=e635]:
              - generic [ref=e636]:
                - img [ref=e637]
                - text: Remote
              - img [ref=e641]
        - generic [ref=e643]:
          - generic [ref=e645]:
            - heading "offered" [level=3] [ref=e647]
            - generic [ref=e648]: "0"
          - generic [ref=e650]:
            - img [ref=e651]
            - paragraph [ref=e654]: No Applications
            - paragraph [ref=e655]: Ready for a new role?
        - generic [ref=e656]:
          - generic [ref=e658]:
            - heading "rejected" [level=3] [ref=e661]
            - generic [ref=e662]: "0"
          - generic [ref=e664]:
            - img [ref=e665]
            - paragraph [ref=e668]: No Applications
            - paragraph [ref=e669]: Ready for a new role?
        - generic [ref=e671]:
          - img [ref=e673]
          - generic [ref=e675]: End of Pipeline
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Udyog Marg - Golden Journeys', () => {
  4  |   
  5  |   test.beforeEach(async ({ page }) => {
  6  |     // 1. Navigate to Login
  7  |     await page.goto('http://localhost:5173/login');
  8  |     
  9  |     // 2. Perform Login
  10 |     await page.fill('input[type="email"]', 'ravishankarpatro@gmail.com');
  11 |     await page.fill('input[type="password"]', 'Password');
  12 |     await page.click('button:has-text("Sign In")');
  13 |     
  14 |     // 3. Wait for Dashboard to be fully loaded and interactive
  15 |     await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  16 |     // Look for the premium greeting or the dashboard stats
  17 |     await expect(page.locator('h1:has-text("Morning,")')).toBeVisible({ timeout: 15000 });
  18 |   });
  19 | 
  20 |   test('Journey 1: Smart Job Discovery (Resilience Check)', async ({ page }) => {
  21 |     // 1. Navigate to Job Pipeline (where the Universal Importer lives)
  22 |     await page.click('nav >> text=Job Pipeline');
  23 |     await page.waitForURL(/.*jobs/);
  24 | 
  25 |     // 2. Enter a URL in the discovery box
  26 |     const discoveryInput = page.locator('input[placeholder*="linkedin.com/jobs/view"]');
  27 |     await expect(page.locator('text=UNIVERSAL JOB IMPORTER')).toBeVisible({ timeout: 10000 });
  28 |     await discoveryInput.fill('https://www.linkedin.com/jobs/view/123456789');
  29 |     
  30 |     // 3. Click Analyze
  31 |     await page.click('button:has-text("Import")');
  32 |     
  33 |     // 4. Verify the "Smart Assistant" starts
  34 |     await expect(page.locator('text=IMPORTING...')).toBeVisible();
  35 |     
  36 |     // 5. Wait for the state to resolve (Resilience Check)
  37 |     // We wait for the spinner to disappear or the modal to show up
  38 |     await expect(page.locator('text=IMPORTING...')).not.toBeVisible({ timeout: 30000 });
  39 | 
  40 |     const pageText = await page.textContent('body');
  41 |     const isHandled = 
  42 |       pageText?.includes('Manual Fallback') || 
  43 |       pageText?.includes('No fresh jobs found') || 
  44 |       pageText?.includes('Scraping Failed') ||
  45 |       pageText?.includes('Add Application') ||
  46 |       pageText?.includes('Success');
  47 | 
  48 |     expect(isHandled).toBe(true);
  49 |   });
  50 | 
  51 |   test('Journey 2: ATS Resume Analysis', async ({ page }) => {
  52 |     // 1. Navigate to Resumes
  53 |     await page.click('nav >> text=Resumes');
  54 |     await page.waitForURL(/.*resumes/);
  55 |     
  56 |     // 2. Verify Resume list is visible
  57 |     await expect(page.locator('h1:has-text("Resumes")')).toBeVisible({ timeout: 15000 });
  58 |     
  59 |     // 3. Go back to Pipeline
  60 |     await page.click('nav >> text=Job Pipeline');
  61 |     await page.waitForURL(/.*jobs/);
  62 |     
  63 |     // 4. Open a REAL Job Detail (Skip "Import Failed" cards)
  64 |     const card = page.locator('.clean-card').filter({ hasNotText: 'Import Failed' }).first();
  65 |     await expect(card).toBeVisible({ timeout: 15000 });
  66 |     await card.click();
  67 |     
  68 |     // 5. Verify Navigation and Match Score
  69 |     await page.waitForURL(/\/jobs\/.+/);
  70 |     await expect(page.locator('h3:has-text("ATS Match Score")')).toBeVisible({ timeout: 15000 });
  71 |   });
  72 | 
  73 |   test('Journey 3: Interview Coaching', async ({ page }) => {
  74 |     // 1. Go directly to a job detail
  75 |     await page.goto('http://localhost:5173/jobs');
  76 |     await page.waitForURL(/.*jobs/);
  77 |     
  78 |     const card = page.locator('.clean-card').filter({ hasNotText: 'Import Failed' }).first();
  79 |     await expect(card).toBeVisible({ timeout: 15000 });
  80 |     await card.click();
  81 |     
> 82 |     await page.waitForURL(/\/jobs\/.+/);
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  83 |     
  84 |     // 2. Wait for Prep Mode to be visible
  85 |     await expect(page.locator('h3:has-text("Interview Prep Mode")')).toBeVisible({ timeout: 15000 });
  86 |     
  87 |     // 3. Generate Prep Guide
  88 |     const generateBtn = page.locator('button:has-text("Generate Prep Guide")');
  89 |     if (await generateBtn.isVisible()) {
  90 |       await generateBtn.click();
  91 |       
  92 |       // 4. Verify coaching tips appear
  93 |       await expect(page.locator('text=Pro Tip:')).toBeVisible({ timeout: 15000 });
  94 |       await expect(page.locator('text=Your 30-Second Intro')).toBeVisible();
  95 |     }
  96 |   });
  97 | 
  98 | });
  99 | 
```