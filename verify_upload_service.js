import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  // 1. Login
  const { data: { session }, error: lError } = await supabase.auth.signInWithPassword({
    email: 'e2e_test_1777205126352@test.com',
    password: 'Password123!'
  });
  if (lError) throw lError;
  console.log("Logged in.");

  // 2. Get the resume created by the subagent
  const { data: resumes } = await supabase.from('resumes').select('id').eq('name', 'Senior Cloud Engineer').single();
  const resumeId = resumes.id;
  console.log("Found resume:", resumeId);

  // 3. Upload file logic (mimicking resumeService.ts)
  const fileContent = fs.readFileSync('test_resume.pdf');
  const versionId = 'service-test-version';
  const filePath = `${session.user.id}/resumes/${resumeId}/${versionId}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(filePath, fileContent, { contentType: 'application/pdf', upsert: true });

  if (uploadError) throw uploadError;
  console.log("File uploaded to storage.");

  const { data: publicUrlData } = supabase.storage
    .from('resumes')
    .getPublicUrl(filePath);

  // 4. Insert version row
  const { data: version, error: vError } = await supabase
    .from('resume_versions')
    .insert({
      resume_id: resumeId,
      version_number: 1,
      file_url: publicUrlData.publicUrl,
      content: { label: 'Service Verified Version' }
    })
    .select()
    .single();

  if (vError) throw vError;
  console.log("Version row created successfully.");
  console.log("Verification: PASS");
}
run().catch(console.error);
