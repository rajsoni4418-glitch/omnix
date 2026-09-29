import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const { data, error } = await supabase.from('profiles').select('username').ilike('username', 'r_jsoni');
console.log("Unescaped Data (r_jsoni):", data);

const { data: data2 } = await supabase.from('profiles').select('username').ilike('username', 'r\\_jsoni');
console.log("Escaped Data (r\\_jsoni):", data2);
