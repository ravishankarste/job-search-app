function testTextIntelligence(input: string) {
  console.log(`[Test] Input: "${input}"`);
  
  let title = "";
  let company = "";
  
  // Try patterns: "Title @ Company", "Title - Company", "Title at Company"
  const delimiters = [' @ ', ' - ', ' at ', ' | '];
  for (const d of delimiters) {
    if (input.includes(d)) {
      const parts = input.split(d);
      title = parts[0].trim();
      company = parts[1].trim();
      break;
    }
  }

  console.log("-------------------------");
  console.log("PARSED RESULT:");
  console.log("Company:", company || "FAILED");
  console.log("Title:  ", title || "FAILED");
  console.log("-------------------------\n");
}

console.log("🧪 Testing Text Intelligence Fallback...\n");

testTextIntelligence("Senior React Developer @ Google");
testTextIntelligence("Product Manager - Stripe");
testTextIntelligence("Fullstack Engineer at Meta");
testTextIntelligence("UI Designer | Apple");
