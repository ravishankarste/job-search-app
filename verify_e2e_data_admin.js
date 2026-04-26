import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFycGxpenNoemFmY2picWtub21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE4OTYyNywiZXhwIjoyMDkyNzY1NjI3fQ._zYOfSQHTg956_A66xcQJIepWLQvjPTzAitNFTVVMEU';
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, SERVICE_ROLE_KEY);

async function verify() {
  console.log("--- Resumes ---");
  const { data: resumes, error: rError } = await supabaseAdmin.from('resumes').select('*').order('created_at', { ascending: false });
  if (rError) console.error(rError);
  else console.log(resumes.map(r => `ID: ${r.id}, Name: ${r.name}, Role: ${r.target_role}`));

  console.log("\n--- Resume Versions ---");
  const { data: versions, error: vError } = await supabaseAdmin.from('resume_versions').select('*, resumes(name)').order('created_at', { ascending: false });
  if (vError) console.error(vError);
  else console.log(versions.map(v => `Resume: ${v.resumes?.name || 'Unknown'}, v${v.version_number}, URL: ${v.file_url?.substring(0, 50)}...`));
}
verify();
