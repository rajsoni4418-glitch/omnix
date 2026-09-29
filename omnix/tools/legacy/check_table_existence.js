import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const tablesToCheck = [
  'wallets',
  'wallet_transactions',
  'wallet_logs',
  'wallet_audit',
  'coin_packs',
  'coin_offers',
  'coin_purchases',
  'purchase_history',
  'purchase_logs',
  'payment_sessions',
  'payment_transactions',
  'shop_items',
  'user_inventory',
  'reward_transactions',
  'profiles'
];

async function run() {
  for (const table of tablesToCheck) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      console.log(`Table EXISTS: ${table}`);
    } else {
      if (error.message.includes('Could not find the table') || error.code === 'PGRST205') {
        console.log(`Table MISSING: ${table}`);
      } else {
        console.log(`Table EXISTS with other error: ${table} (${error.code}) - ${error.message}`);
      }
    }
  }
}
run();
