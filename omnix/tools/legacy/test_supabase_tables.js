import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const tables = [
    'users', 
    'creator_earnings', 
    'earning_transactions', 
    'withdrawal_requests', 
    'withdrawal_methods'
  ];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table '${table}' failed:`, error.message);
    } else {
      console.log(`Table '${table}' exists and is queryable! Row count sample:`, data.length);
    }
  }
}
run();
