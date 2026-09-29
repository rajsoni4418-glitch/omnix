import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: itemData, error: itemError } = await supabase.from('reward_shop_items').select('*');
  console.log('reward_shop_items:', itemData, itemError);
}
run();
