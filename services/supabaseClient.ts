/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase Project URL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials are missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Admin client with service_role key (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl || '', supabaseServiceKey)
    : supabase;

