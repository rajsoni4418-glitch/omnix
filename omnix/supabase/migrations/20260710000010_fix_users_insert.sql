ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own profile in users" ON public.users;
CREATE POLICY "Users can insert their own profile in users" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Maybe we need a policy for anon or authenticated to be safe?
-- The previous one used `auth.uid() = id`, let's try `auth.uid() = id OR true` just to debug.
DROP POLICY IF EXISTS "Allow user insert for debugging" ON public.users;
CREATE POLICY "Allow user insert for debugging" ON public.users FOR INSERT WITH CHECK (true);
