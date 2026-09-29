import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function check() {
  const { error } = await supabase.from('stories').select('invalid_column').limit(1);
  console.log("Error:", error?.message);
}
check();
