
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const SUPABASE_URL = "https://lbimyadljayocvekulwy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiaW15YWRsamF5b2N2ZWt1bHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTIzOTUsImV4cCI6MjA1OTk2ODM5NX0.HPtHfl3GUqCaAS7i_-cxOBvzH4YlVopYJNVl9MV3Fh8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
