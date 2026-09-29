import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: "SELECT * FROM pg_policies WHERE tablename = 'stories'" });
  if (error) {
    console.log("No rpc exec_sql, I will fetch policies using fetch");
  }
}
check();
