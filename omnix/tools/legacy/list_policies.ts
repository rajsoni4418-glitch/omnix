import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('stories').insert({
    user_id: '80feb0bc-fd87-409b-a885-8fbd153ba52f',
    media_url: 'test',
    expires_at: new Date().toISOString()
  }).select();
  console.log("Insert Anon:", error?.message);
}
check();
