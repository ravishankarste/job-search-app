import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = "Password123!";

  console.log(`🧪 Testing Sign Up for: ${testEmail}...`);

  // 1. Test Sign Up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signUpError) {
    console.error("❌ Sign Up Failed:", signUpError.message);
    return;
  }
  console.log("✅ Sign Up Request Successful!");

  // Note: Depending on your Supabase config, the user might be signed in immediately
  // or they might need email verification.
  if (signUpData.session) {
    console.log("✅ User signed in immediately!");
  } else {
    console.log("ℹ️ Email verification likely required (or user created but not signed in).");
  }

  // 2. Test Sign In (using existing test credentials or attempting the new ones)
  console.log(`\n🧪 Testing Sign In...`);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    // If verification is required, this might fail with "Email not confirmed"
    console.log(`ℹ️ Sign In Status: ${signInError.message}`);
  } else {
    console.log("✅ Sign In Successful!");
    console.log("User ID:", signInData.user?.id);
  }

  console.log("\n-------------------------");
  console.log("AUTH TEST COMPLETE");
  console.log("-------------------------\n");
}

testAuth();
