-- Ensure users can insert their own profile regardless of id mapping
DROP POLICY IF EXISTS "Users can insert their own profile in users" ON public.users;
CREATE POLICY "Users can insert their own profile in users" ON public.users FOR INSERT WITH CHECK (email = auth.jwt()->>'email' OR auth.uid() = id);

-- Advanced RLS for stories to handle potential auth.uid() and users.id mismatch
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert stories" ON public.stories;
CREATE POLICY "Users can insert stories" ON public.stories FOR INSERT WITH CHECK (
  user_id = auth.uid() OR
  user_id IN (SELECT id FROM public.users WHERE email = auth.jwt()->>'email')
);
