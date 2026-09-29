DROP POLICY IF EXISTS "Admins can view reports" ON user_reports;

CREATE POLICY "Admins can view reports" ON user_reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Admins can manage reports" ON user_reports
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);
