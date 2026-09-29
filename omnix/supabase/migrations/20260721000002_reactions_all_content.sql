-- Create reactions table to handle reactions for posts, stories, and clips
CREATE TABLE IF NOT EXISTS public.reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  story_id uuid REFERENCES public.stories(id) ON DELETE CASCADE,
  clip_id uuid REFERENCES public.omniclips(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT chk_reaction_target CHECK (
    (post_id IS NOT NULL AND story_id IS NULL AND clip_id IS NULL) OR
    (post_id IS NULL AND story_id IS NOT NULL AND clip_id IS NULL) OR
    (post_id IS NULL AND story_id IS NULL AND clip_id IS NOT NULL)
  )
);

-- Ensure a user can only react with a specific emoji once per target
CREATE UNIQUE INDEX IF NOT EXISTS idx_reactions_unique_post ON public.reactions(post_id, user_id, reaction_type) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_reactions_unique_story ON public.reactions(story_id, user_id, reaction_type) WHERE story_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_reactions_unique_clip ON public.reactions(clip_id, user_id, reaction_type) WHERE clip_id IS NOT NULL;

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reactions are viewable by everyone" ON public.reactions;
CREATE POLICY "Reactions are viewable by everyone" 
ON public.reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own reactions" ON public.reactions;
CREATE POLICY "Users can insert their own reactions" 
ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reactions" ON public.reactions;
CREATE POLICY "Users can update their own reactions" 
ON public.reactions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.reactions;
CREATE POLICY "Users can delete their own reactions" 
ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- Story likes
CREATE TABLE IF NOT EXISTS public.story_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id uuid REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(story_id, user_id)
);

ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Story likes are viewable by everyone" ON public.story_likes;
CREATE POLICY "Story likes are viewable by everyone" 
ON public.story_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own story likes" ON public.story_likes;
CREATE POLICY "Users can insert their own story likes" 
ON public.story_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own story likes" ON public.story_likes;
CREATE POLICY "Users can delete their own story likes" 
ON public.story_likes FOR DELETE USING (auth.uid() = user_id);

