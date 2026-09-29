import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function check() {
  const { data, error } = await supabase.from('story_views').insert({story_id: 'd30e7f10-e89b-41a3-a485-0c442513da35'}).select();
  console.log(error || data);
}
check();
