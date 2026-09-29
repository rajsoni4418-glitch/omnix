import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
const sql = fs.readFileSync('supabase/migrations/20260720000000_business_ads.sql', 'utf8');

async function run() {
  console.log('Applying Business Migration to Supabase...');
  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error('Error applying business migration:', error);
  } else {
    console.log('Business migration applied successfully! Result:', data);
  }
}
run();
