import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: catData, error: catError } = await supabase.from('shop_categories').select('*');
  console.log('shop_categories:', catData, catError);
  
  const { data: itemData, error: itemError } = await supabase.from('shop_items').select('*, shop_categories(name)');
  console.log('shop_items:', itemData, itemError);
}
run();
