import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function check() {
  const cols = ['media_type', 'duration', 'view_count', 'privacy', 'music', 'thumbnail_url', 'reaction_count', 'reply_count'];
  for (const col of cols) {
    const { error } = await supabase.from('stories').select(col).limit(1);
    if (error) console.log(`Error for ${col}:`, error.message);
    else console.log(`${col} exists`);
  }
}
check();
