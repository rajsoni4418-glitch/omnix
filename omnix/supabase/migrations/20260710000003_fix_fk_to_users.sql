ALTER TABLE public.stories
  DROP CONSTRAINT IF EXISTS stories_user_id_fkey;

ALTER TABLE public.stories
  ADD CONSTRAINT stories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
