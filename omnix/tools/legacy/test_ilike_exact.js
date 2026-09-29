import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const { data: d1 } = await supabase.from('profiles').select('username').ilike('username', 'rajsoni');
console.log("rajsoni:", d1);

const { data: d2 } = await supabase.from('profiles').select('username').ilike('username', 'RajSoni');
console.log("RajSoni:", d2);

const { data: d3 } = await supabase.from('profiles').select('username').ilike('username', 'raj_soni');
console.log("raj_soni:", d3);

