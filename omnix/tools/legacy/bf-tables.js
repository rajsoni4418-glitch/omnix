import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const tables = [
  'users',
  'posts',
  'likes',
  'comments',
  'omniclips',
  'communities',
  'messages',
  'notifications',
  'wallet_transactions',
  'live_streams',
  'post_likes',
  'post_comments',
  'follows',
  'followers'
];

async function run() {
  for (const t of tables) {
    const { error } = await supabase.from(t).select('id').limit(1);
    if (!error) {
      console.log("Table exists:", t);
    } else if (error.message.includes('Could not find the table')) {
      console.log("Table missing:", t);
    } else {
      console.log("Table exists (with error):", t, error.message);
    }
  }
}

run();
