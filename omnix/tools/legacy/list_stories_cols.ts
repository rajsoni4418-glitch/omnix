import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('stories').select('*').limit(1);
  if (error) console.log(error);
  // Just print the schema if possible, or wait, we can't see the schema without the service key or without data.
  // Wait, we can query a known column to see if it exists.
  const cols = ['id', 'user_id', 'media_url', 'caption', 'created_at', 'expires_at', 'thumbnail_url', 'privacy', 'music'];
  for (const col of cols) {
    const { error: e } = await supabase.from('stories').select(`id, ${col}`).limit(1);
    console.log(`Column ${col}:`, e ? e.message : 'exists');
  }
}
check();
