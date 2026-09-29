import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function run() {
  const query = `
    CREATE TABLE IF NOT EXISTS public.reactions (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
      user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
      reaction_type text NOT NULL,
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
      UNIQUE(post_id, user_id, reaction_type)
    );

    ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Reactions are viewable by everyone" ON public.reactions;
    CREATE POLICY "Reactions are viewable by everyone" 
    ON public.reactions FOR SELECT 
    USING (true);

    DROP POLICY IF EXISTS "Users can insert their own reactions" ON public.reactions;
    CREATE POLICY "Users can insert their own reactions" 
    ON public.reactions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own reactions" ON public.reactions;
    CREATE POLICY "Users can update their own reactions" 
    ON public.reactions FOR UPDATE 
    USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.reactions;
    CREATE POLICY "Users can delete their own reactions" 
    ON public.reactions FOR DELETE 
    USING (auth.uid() = user_id);

    CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON public.reactions(post_id);
    CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);
  `;

  const { data, error } = await supabase.rpc('exec_sql', { query });
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success creating reactions table.');
  }
}
run();
