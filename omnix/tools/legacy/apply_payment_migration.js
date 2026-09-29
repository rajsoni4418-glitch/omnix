import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
const sql = fs.readFileSync('supabase/migrations/20260719000000_payment_gateway.sql', 'utf8');

async function run() {
  console.log('Applying Payment Gateway Migration to Supabase...');
  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error('Error applying payment migration:', error);
  } else {
    console.log('Payment migration applied successfully! Result:', data);
  }
}
run();
