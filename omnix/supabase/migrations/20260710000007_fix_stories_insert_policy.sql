ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert stories" ON public.stories;
CREATE POLICY "Users can insert stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can insert stories temp" ON public.stories;
CREATE POLICY "Anyone can insert stories temp" ON public.stories FOR INSERT WITH CHECK (true);
