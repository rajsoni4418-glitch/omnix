ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own profile in users" ON public.users;
CREATE POLICY "Users can insert their own profile in users" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Anyone can insert users temp" ON public.users;
CREATE POLICY "Anyone can insert users temp" ON public.users FOR INSERT WITH CHECK (true);
