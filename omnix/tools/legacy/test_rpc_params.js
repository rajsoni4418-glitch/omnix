import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function run() {
  const { data: d1, error: e1 } = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
  console.log('e1:', e1);
  const { data: d2, error: e2 } = await supabase.rpc('exec_sql', { sql_string: 'SELECT 1;' });
  console.log('e2:', e2);
  const { data: d3, error: e3 } = await supabase.rpc('exec_sql', { sql_query: 'SELECT 1;' });
  console.log('e3:', e3);
}
run();
