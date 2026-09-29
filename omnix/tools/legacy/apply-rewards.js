import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
const sql = fs.readFileSync('supabase/migrations/20260710000015_add_rewards.sql', 'utf8') + "\nNOTIFY pgrst, 'reload schema';";

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error('Error applying migration:', error);
  } else {
    console.log('Migration applied successfully.');
  }
}
run();
