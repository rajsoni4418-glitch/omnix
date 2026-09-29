DROP POLICY IF EXISTS "Anyone can insert users temp" ON public.users;
DROP POLICY IF EXISTS "Anyone can insert stories temp" ON public.stories;

-- Fix users policy:
DROP POLICY IF EXISTS "Users can insert their own profile in users" ON public.users;
CREATE POLICY "Users can insert their own profile in users" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Fix stories policy:
DROP POLICY IF EXISTS "Users can insert stories" ON public.stories;
CREATE POLICY "Users can insert stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);
