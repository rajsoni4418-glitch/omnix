import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('posts').select('*, profiles!posts_user_id_fkey(username, avatar_url, full_name, is_verified)').limit(1);
  console.log(error);
}
test();
