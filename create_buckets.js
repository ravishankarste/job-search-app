import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFycGxpenNoemFmY2picWtub21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE4OTYyNywiZXhwIjoyMDkyNzY1NjI3fQ._zYOfSQHTg956_A66xcQJIepWLQvjPTzAitNFTVVMEU';
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, SERVICE_ROLE_KEY);

async function create() {
  const buckets = ['resumes', 'cover_letters', 'user_uploads'];
  for (const b of buckets) {
    const { data, error } = await supabaseAdmin.storage.createBucket(b, {
      public: false,
      allowedMimeTypes: ['application/pdf'],
      fileSizeLimit: 10485760 // 10MB
    });
    if (error) {
      console.log(`Bucket ${b} error:`, error.message);
    } else {
      console.log(`Bucket ${b} created successfully.`);
    }
  }
}
create();
