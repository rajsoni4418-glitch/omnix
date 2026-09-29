ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public users are viewable by everyone" ON public.users;
CREATE POLICY "Public users are viewable by everyone" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile in users" ON public.users;
CREATE POLICY "Users can insert their own profile in users" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile in users" ON public.users;
CREATE POLICY "Users can update their own profile in users" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Make sure stories RLS allows insert with correct user_id
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert stories" ON public.stories;
CREATE POLICY "Users can insert stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);
