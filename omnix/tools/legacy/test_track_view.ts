import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function check() {
  const { data: { session } } = await supabase.auth.signInWithPassword({ email: 'emma_w@example.com', password: 'password123' });
  const { data: story } = await supabase.from('stories').select('id, view_count').limit(1).single();
  console.log("Story before:", story);
  
  if (session && story) {
      const res = await supabase.from('story_viewers').insert({
          story_id: story.id,
          user_id: session.user.id
      }).select().single();
      console.log("Insert result:", res);
      
      const { data: storyAfter } = await supabase.from('stories').select('id, view_count').eq('id', story.id).single();
      console.log("Story after:", storyAfter);
  }
}
check();
