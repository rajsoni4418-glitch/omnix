import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const words = ['reaction', 'reactions', 'post_reaction', 'post_reactions', 'emoji', 'emojis', 'post_emojis', 'like_types', 'engagement', 'interactions', 'user_reactions', 'user_interactions'];
async function scan() {
  for (const w of words) {
    const { status } = await supabase.from(w).select('*').limit(1);
    if (status !== 404) {
      console.log(`FOUND: ${w}`);
    }
  }
}
scan();
