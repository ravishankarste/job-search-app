import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  // 1. Login
  const { data: { session }, error: lError } = await supabase.auth.signInWithPassword({
    email: 'e2e_test_1777205126352@test.com',
    password: 'Password123!'
  });
  if (lError) {
    console.error("Login failed:", lError.message);
    return;
  }
  const user = session.user;
  console.log("Logged in as:", user.id);

  // 2. Try upload
  const resumeId = '6b5df9e3-9292-44ed-9569-22e35100cf51'; // From previous verification
  const versionId = 'test-' + Date.now();
  const filePath = `${user.id}/resumes/${resumeId}/${versionId}.pdf`;
  
  const fileContent = Buffer.from("%PDF-1.4\n%EOF");
  
  console.log("Attempting upload to:", filePath);
  const { data, error } = await supabase.storage
    .from('resumes')
    .upload(filePath, fileContent, { contentType: 'application/pdf' });

  if (error) {
    console.error("Upload failed:", error);
  } else {
    console.log("Upload success:", data);
  }
}
test();
