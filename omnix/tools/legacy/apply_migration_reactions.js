import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const sql = fs.readFileSync('supabase/migrations/20260721000002_reactions_all_content.sql', 'utf8');

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error('Error applying migration:', error);
  } else {
    console.log('Migration applied successfully:', data);
  }
}
run();
