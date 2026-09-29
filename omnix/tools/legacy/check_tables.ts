import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function check() {
  let { data, error } = await supabase.from('pinned_stories').select('*').limit(1);
  console.log("pinned_stories:", error ? error.message : "Exists");
  
  ({ data, error } = await supabase.from('story_highlights').select('*').limit(1));
  console.log("story_highlights:", error ? error.message : "Exists");
  
  ({ data, error } = await supabase.from('highlights').select('*').limit(1));
  console.log("highlights:", error ? error.message : "Exists");
}
check();
