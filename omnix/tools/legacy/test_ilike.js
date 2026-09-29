import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const username = 'raj_soni';
const escaped = username.replace(/_/g, '\\_');

const { data, error } = await supabase.from('profiles').select('username').ilike('username', escaped);
console.log("Escaped:", escaped, "Data:", data, "Error:", error);
