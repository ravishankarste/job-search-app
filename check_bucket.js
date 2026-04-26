import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("Bucket List Error:", error.message);
  } else {
    console.log("Buckets:", data.map(b => b.name));
    const resumesBucket = data.find(b => b.name === 'resumes');
    if (resumesBucket) {
      console.log("Resumes bucket exists.");
    } else {
      console.log("Resumes bucket DOES NOT EXIST.");
    }
  }
}
check();
