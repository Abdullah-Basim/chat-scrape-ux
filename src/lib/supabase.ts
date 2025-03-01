
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables or direct values
// For production, these should come from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for user management
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  return data.user;
};

// Function to save LLM history
export const saveLLMHistory = async (userId: string, module: 'scraper' | 'chatbot', data: any) => {
  const { error } = await supabase
    .from('llm_history')
    .insert({
      user_id: userId,
      module_type: module,
      data: data,
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error saving LLM history:', error);
    return false;
  }
  
  return true;
};

// Function to get user's LLM history
export const getLLMHistory = async (userId: string, module?: 'scraper' | 'chatbot') => {
  let query = supabase
    .from('llm_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (module) {
    query = query.eq('module_type', module);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching LLM history:', error);
    return [];
  }
  
  return data;
};
