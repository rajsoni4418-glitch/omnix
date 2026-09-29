import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function run() {
  const sql = fs.readFileSync('supabase/migrations/20260710000015_add_rewards.sql', 'utf8') + 
              '\n' + fs.readFileSync('supabase/migrations/20260710000016_purchase_rpc.sql', 'utf8');
              
  // since supabase client cannot execute raw sql easily, we can try to use a postgres client
}
run();
