import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase.rpc('get_tables_and_policies', {});
  if (error) {
    console.error('Error:', error);
  } else {
    const d = data.filter(d => d.table_name === 'likes' || d.table_name === 'reactions' || d.table_name.includes('reaction'));
    console.log(JSON.stringify(d, null, 2));
  }
}
run();
