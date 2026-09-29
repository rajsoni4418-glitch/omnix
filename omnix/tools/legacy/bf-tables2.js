import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const tables = [
  'shop_items', 'reward_shop_items', 'rewards', 'inventory', 'user_inventory', 
  'missions', 'user_missions', 'achievements', 'user_achievements', 'shop_categories',
  'economy_balances', 'economy_levels', 'economy_transactions'
];

async function run() {
  for (const t of tables) {
    const { error } = await supabase.from(t).select('*').limit(1);
    if (!error) {
      console.log("Table exists:", t);
    } else if (error.message.includes('Could not find the table') || error.code === 'PGRST205') {
      // missing
    } else {
      console.log("Table exists (with error):", t, error.message);
    }
  }
}
run();
