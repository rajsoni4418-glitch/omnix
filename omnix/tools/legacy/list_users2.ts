import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('users').select('id, username').limit(10);
  console.log("users:", data);
  const { data: p, error: pe } = await supabase.from('profiles').select('id, username').limit(10);
  console.log("profiles:", p);
}
check();
