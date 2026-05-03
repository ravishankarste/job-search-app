import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  // 1. Login
  const { data: { session }, error: lError } = await supabase.auth.signInWithPassword({
    email: 'e2e_test_1777205126352@test.com',
    password: 'Password123!'
  });
  if (lError) throw lError;
  
  const user = session.user;
  console.log("Logged in as:", user.id);

  const resumeId = '6b5df9e3-9292-44ed-9569-22e35100cf51';
  
  console.log("Attempting DB Insert...");
  const { data, error } = await supabase
    .from('resume_versions')
    .insert({
      resume_id: resumeId,
      version_number: 99, // Unique for this test
      file_url: 'https://example.com/test.pdf',
      content: { label: 'Integration Test' }
    })
    .select()
    .single();

  if (error) {
    console.error("Insert failed:", error);
  } else {
    console.log("Insert success:", data);
  }
}
test();
