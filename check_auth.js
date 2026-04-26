import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const email = `test_${Date.now()}@example.com`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'Password123!'
  });
  if (error) {
    console.error("Auth Error:", error.message);
  } else {
    console.log("Auth Success. Session exists:", !!data.session);
    console.log("User email confirmed at:", data.user?.email_confirmed_at);
  }
}
check();
