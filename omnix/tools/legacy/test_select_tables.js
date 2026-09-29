import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const tables = ['payment_gateways', 'payment_orders', 'payment_transactions', 'payment_history', 'refund_requests', 'refund_history', 'payment_logs', 'invoices'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table ${table} error:`, error.message);
    } else {
      console.log(`Table ${table} exists and selected successfully!`);
    }
  }
}
run();
