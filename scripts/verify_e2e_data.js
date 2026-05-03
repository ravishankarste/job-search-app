import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function verify() {
  console.log("--- Resumes ---");
  const { data: resumes, error: rError } = await supabase.from('resumes').select('*').order('created_at', { ascending: false });
  if (rError) console.error(rError);
  else console.log(resumes.map(r => `ID: ${r.id}, Name: ${r.name}, Role: ${r.target_role}`));

  console.log("\n--- Resume Versions ---");
  const { data: versions, error: vError } = await supabase.from('resume_versions').select('*, resumes(name)').order('created_at', { ascending: false });
  if (vError) console.error(vError);
  else console.log(versions.map(v => `Resume: ${v.resumes.name}, v${v.version_number}, URL: ${v.file_url.substring(0, 50)}...`));
}
verify();
