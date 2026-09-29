
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert stories temp" ON stories;
CREATE POLICY "Anyone can insert stories temp" ON stories FOR INSERT WITH CHECK (true);
