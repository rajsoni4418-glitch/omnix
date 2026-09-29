
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert stories" ON stories;
CREATE POLICY "Users can insert stories" ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view stories" ON stories;
CREATE POLICY "Users can view stories" ON stories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
CREATE POLICY "Users can update own stories" ON stories FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Users can delete own stories" ON stories FOR DELETE USING (auth.uid() = user_id);
