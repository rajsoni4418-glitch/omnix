import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const cols = ['id', 'user_id', 'media_url', 'media_type', 'caption', 'privacy', 'expires_at', 'music', 'duration', 'view_count', 'reaction_count', 'reply_count', 'created_at'];
async function run() {
  for (const col of cols) {
    const { error } = await supabase.from('stories').select(col).limit(1);
    if (error) console.log(`Missing: ${col}`);
    else console.log(`Exists: ${col}`);
  }
}
run();
