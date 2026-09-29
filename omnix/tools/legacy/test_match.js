import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const username = 'rajsoni';

const { data, error } = await supabase.from('profiles').select('username').ilike('username', 'raj_soni');
console.log("Unescaped Data (raj_soni):", data);

const { data: data2 } = await supabase.from('profiles').select('username').ilike('username', 'raj\\_soni');
console.log("Escaped Data (raj\\_soni):", data2);
