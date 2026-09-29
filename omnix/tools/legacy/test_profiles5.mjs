import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('posts').select(`id, profiles(id, username, display_name, is_verified, avatar_url)`).limit(1);
  console.log(error);
  if (data) console.log(data);
}
test();
