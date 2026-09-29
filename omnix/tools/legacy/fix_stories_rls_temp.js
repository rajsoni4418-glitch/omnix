import fs from 'fs';
const sql = `
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert stories temp" ON stories;
CREATE POLICY "Anyone can insert stories temp" ON stories FOR INSERT WITH CHECK (true);
`;
fs.writeFileSync('supabase/migrations/20260709000000_temp_insert_rls.sql', sql);
