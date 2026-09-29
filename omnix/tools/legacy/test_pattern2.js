import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const username = 'raj';
const strippedInput = username.replace(/[._]/g, '');
const pattern = strippedInput.split('').join('%');

console.log("Pattern:", pattern);

const { data, error } = await supabase.from('profiles').select('username').ilike('username', pattern);
console.log("Data:", data, "Error:", error);
