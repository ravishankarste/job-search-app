import { supabase } from './src/lib/supabaseClient';

async function checkResumes() {
  const { data: { user } } = await supabase.auth.getUser();
  console.log("Current User:", user?.id);

  if (user) {
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('*');
    
    console.log("All Resumes in DB:", resumes?.length);
    if (resumes) {
      console.log("First Resume Profile ID:", resumes[0]?.profile_id);
      console.log("User Match:", resumes[0]?.profile_id === user.id);
    }
  }
}

checkResumes();
