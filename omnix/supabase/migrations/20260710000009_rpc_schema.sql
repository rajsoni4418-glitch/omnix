CREATE OR REPLACE FUNCTION get_users_schema() RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(row_to_json(c)) INTO result
  FROM information_schema.columns c
  WHERE table_name = 'users' AND table_schema = 'public';
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
