import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url("VITE_SUPABASE_URL must be a valid URL"),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, "VITE_SUPABASE_ANON_KEY is required"),
});

// Extract environment variables using import.meta.env
const envVars = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// Validate the environment variables
const parsedEnv = envSchema.safeParse(envVars);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables. Check your .env file.");
}

export const env = parsedEnv.data;
