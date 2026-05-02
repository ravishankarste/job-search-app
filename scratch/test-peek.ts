import dotenv from 'dotenv';
// Using native fetch available in Node 22

// Mocking the environment and minimal fetch for Node.js
dotenv.config();

const apifyService = {
  async runActorAndGetResults(actorId: string, input: any, token: string): Promise<any[]> {
    const formattedId = actorId.replace('/', '~');
    const runUrl = `https://api.apify.com/v2/acts/${formattedId}/runs?token=${token}`;
    const runRes = await fetch(runUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const rawRes = await runRes.json() as any;
    if (!rawRes.data) {
      console.error("[Test] Apify Error Response:", JSON.stringify(rawRes, null, 2));
      throw new Error("Apify Start Failed");
    }
    const { data } = rawRes;
    console.log(`[Test] Actor started: ${data.id}. Waiting for results...`);
    
    const startTime = Date.now();
    const timeout = 180000; 
    while (Date.now() - startTime < timeout) {
      const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${data.id}?token=${token}`);
      const { data: statusData } = await statusRes.json() as any;
      if (statusData.status === 'SUCCEEDED') break;
      console.log(`[Test] Status: ${statusData.status}...`);
      await new Promise(r => setTimeout(r, 5000));
    }

    const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${data.defaultDatasetId}/items?token=${token}`);
    return await itemsRes.json() as any[];
  },

  async peekUrlMetadata(url: string, token: string): Promise<{ title?: string, company?: string }> {
    console.log(`[Test] Peeking web for: ${url}`);
    
    let query = url;
    if (url.includes('linkedin.com/jobs/view/')) {
      const id = url.split('/view/')[1]?.split('/')[0]?.split('?')[0];
      if (id) query = `site:linkedin.com/jobs/view/ ${id}`;
    }

    const actorId = 'apify~google-search-scraper';
    const input = { queries: query, maxPagesPerQuery: 1, resultsPerPage: 1 };

    try {
      const results = await this.runActorAndGetResults(actorId, input, token);
      if (results && results[0]?.organicResults?.[0]) {
        const fullTitle = results[0].organicResults[0].title || "";
        console.log(`[Test] Full Title Found: ${fullTitle}`);

        if (fullTitle.includes(' at ') && fullTitle.includes('|')) {
          const mainPart = fullTitle.split('|')[0];
          const [title, company] = mainPart.split(' at ');
          return { title: title.trim(), company: company.trim() };
        }

        if (fullTitle.toLowerCase().includes(' hiring ')) {
          const parts = fullTitle.split(/ hiring /i);
          const company = parts[0].trim();
          const title = parts[1].split(' in ')[0].split('|')[0].trim();
          return { title, company };
        }

        const parts = fullTitle.split(' | ')[0].split(' - ');
        return {
          title: parts[0]?.trim(),
          company: parts[1]?.trim() || "Unknown Company"
        };
      }
    } catch (e) {
      console.error("[Test] Peek failed", e);
    }
    return {};
  }
};

async function runTest() {
  const token = process.env.VITE_APIFY_API_TOKEN;
  if (!token) {
    console.error("No token found in .env");
    return;
  }

  const testUrl = "https://www.linkedin.com/jobs/view/4393908021";
  const result = await apifyService.peekUrlMetadata(testUrl, token);
  
  console.log("\n-------------------------");
  console.log("FINAL TEST RESULT:");
  console.log("-------------------------");
  console.log("Company:", result.company);
  console.log("Title:  ", result.title);
  console.log("-------------------------\n");
}

runTest();
