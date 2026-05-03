import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFycGxpenNoemFmY2picWtub21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE4OTYyNywiZXhwIjoyMDkyNzY1NjI3fQ._zYOfSQHTg956_A66xcQJIepWLQvjPTzAitNFTVVMEU';
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabaseAdmin.storage.listBuckets();
  if (error) {
    console.error("Bucket List Error:", error.message);
  } else {
    console.log("Buckets:", data.map(b => b.name));
  }
}
check();
