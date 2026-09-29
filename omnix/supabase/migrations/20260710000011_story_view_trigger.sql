CREATE OR REPLACE FUNCTION update_story_view_count()
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

DROP TRIGGER IF EXISTS tr_story_viewers_insert ON public.story_viewers;
CREATE TRIGGER tr_story_viewers_insert
  AFTER INSERT ON public.story_viewers
  FOR EACH ROW
  EXECUTE FUNCTION update_story_view_count();
