import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function check() {
  const { data, error } = await supabase.from('stories').select('*').not('music', 'is', null);
  console.log("stories with music:", data?.length);
  if (data?.length) {
    console.log(data[0].music);
  }
}
check();
