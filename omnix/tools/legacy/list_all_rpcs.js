import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function run() {
  // Try to use introspection if possible, but PostgREST /rpc endpoints are mapped to functions
  // We can't list them easily without schema access.
  // Let's just try to call a known function `get_schema_info` or `get_table_info`
  let { data, error } = await supabase.rpc('get_schema_info');
  console.log('get_schema_info:', data, error);
}
run();
