import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const tables = [
  'premium_plans',
  'user_subscriptions',
  'subscription_history',
  'subscription_features',
  'subscription_logs',
  'notifications',
  'users'
];

async function check() {
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`Table ${t}: Error: ${error.message}`);
    } else {
      console.log(`Table ${t}: Exists!`);
    }
  }
}
check();
