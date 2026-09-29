import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function check() {
  const { data: d2, error: e2 } = await supabase.auth.signInWithPassword({ email: 'rajsoni4418@gmail.com', password: 'password123' });
  const { data: story } = await supabase.from('stories').select('id, view_count').limit(1).single();
  
  if (d2.session && story) {
      const { data, error } = await supabase.from('story_viewers').insert({
          story_id: story.id,
          user_id: d2.session.user.id
      }).select().single();
      console.log("Insert res:", data, error);
  } else {
      console.log("Login err:", e2);
  }
}
check();
