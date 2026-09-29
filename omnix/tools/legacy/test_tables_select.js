import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('shop_items').select('*');
  console.log('shop_items exists:', !error, error?.message || '');
  if (data) {
    console.log('shop_items:', data);
  }
}
run();
