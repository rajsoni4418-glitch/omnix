import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function check() {
  let { data, error } = await supabase.from('bookmarks').select('*').limit(1);
  console.log("bookmarks:", error ? error.message : "Exists");
  
  ({ data, error } = await supabase.from('saved_posts').select('*').limit(1));
  console.log("saved_posts:", error ? error.message : "Exists");
  
  ({ data, error } = await supabase.from('saved_stories').select('*').limit(1));
  console.log("saved_stories:", error ? error.message : "Exists");
}
check();
