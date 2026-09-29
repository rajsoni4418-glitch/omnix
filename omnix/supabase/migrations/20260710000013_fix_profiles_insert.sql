ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow user insert for debugging profiles" ON public.profiles;
CREATE POLICY "Allow user insert for debugging profiles" ON public.profiles FOR INSERT WITH CHECK (true);
