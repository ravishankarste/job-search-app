import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use SERVICE_ROLE key to bypass email confirmation
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFycGxpenNoemFmY2picWtub21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE4OTYyNywiZXhwIjoyMDkyNzY1NjI3fQ._zYOfSQHTg956_A66xcQJIepWLQvjPTzAitNFTVVMEU';
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  const email = `e2e_test_${Date.now()}@test.com`;
  const password = 'Password123!';
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    console.error("Error creating user:", error.message);
  } else {
    console.log("SUCCESS_USER_CREATED");
    console.log("EMAIL:", email);
    console.log("PASSWORD:", password);
  }
}
run();
