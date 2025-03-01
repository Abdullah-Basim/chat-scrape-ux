import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with real credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gamvngtrwzggghngocip.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbXZuZ3Ryd3pnZ2dobmdvY2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTYzMjksImV4cCI6MjA1NjQzMjMyOX0._AjUUQkUEDUmKaYdEAJ7H3heGq8TDUArMAEJDEPJk3M';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://your-project-url.supabase.co' && 
         supabaseAnonKey !== 'your-anon-key' &&
         supabaseUrl.includes('.supabase.co');
};

// Helper functions for user management
export const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) {
    console.error('Supabase is not properly configured. Please check your environment variables.');
    return null;
  }
  
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return data.user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

// Function to save LLM history
export const saveLLMHistory = async (userId: string, module: 'scraper' | 'chatbot', data: any) => {
  if (!isSupabaseConfigured()) {
    console.error('Supabase is not properly configured. Please check your environment variables.');
    return false;
  }
  
  try {
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
  } catch (error) {
    console.error('Error in saveLLMHistory:', error);
    return false;
  }
};

// Function to get user's LLM history
export const getLLMHistory = async (userId: string, module?: 'scraper' | 'chatbot') => {
  if (!isSupabaseConfigured()) {
    console.error('Supabase is not properly configured. Please check your environment variables.');
    return [];
  }
  
  try {
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
  } catch (error) {
    console.error('Error in getLLMHistory:', error);
    return [];
  }
};
