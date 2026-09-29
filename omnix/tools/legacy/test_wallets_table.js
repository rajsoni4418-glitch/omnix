import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('wallets').select('*').limit(1);
  console.log('wallets table exists:', !error, error?.message || '');
  if (data) {
    console.log('wallets data:', data);
  }
}
run();
