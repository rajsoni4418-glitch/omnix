CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can see story views" ON public.story_views;
CREATE POLICY "Anyone can see story views" ON public.story_views FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own view" ON public.story_views;
CREATE POLICY "Users can insert own view" ON public.story_views FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_story_view_count_live()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.stories
    SET view_count = view_count + 1
    WHERE id = NEW.story_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_story_views_insert ON public.story_views;
CREATE TRIGGER tr_story_views_insert
  AFTER INSERT ON public.story_views
  FOR EACH ROW
  EXECUTE FUNCTION update_story_view_count_live();

