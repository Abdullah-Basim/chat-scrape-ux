
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - in production, these would come from environment variables
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
