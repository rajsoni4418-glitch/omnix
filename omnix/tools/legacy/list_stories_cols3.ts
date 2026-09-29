import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function check() {
  const cols = ['media_type', 'duration', 'view_count', 'reaction_count', 'reply_count'];
  for (const col of cols) {
    const { error: e } = await supabase.from('stories').select(`id, ${col}`).limit(1);
    console.log(`Column ${col}:`, e ? e.message : 'exists');
  }
}
check();
