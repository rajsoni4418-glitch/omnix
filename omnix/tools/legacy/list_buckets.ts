import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.storage.listBuckets();
  console.log("Buckets:", data?.map(b => b.name), error);
}
check();
