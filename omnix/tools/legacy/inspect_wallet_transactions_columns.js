import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('wallet_transactions').select('*').limit(1);
  if (error) {
    console.error('Error selecting from wallet_transactions:', error.message);
  } else {
    console.log('Sample transaction row:', data[0] || 'No rows exist yet');
    // Let's also insert a test row or see what columns are expected by trying to select a non-existent column
    // to see if we can trigger a list of columns
    const { error: selectErr } = await supabase.from('wallet_transactions').select('non_existent_col').limit(1);
    if (selectErr && selectErr.message.includes('column')) {
      console.log('Postgres error with columns:', selectErr.message);
    }
  }
}
run();
