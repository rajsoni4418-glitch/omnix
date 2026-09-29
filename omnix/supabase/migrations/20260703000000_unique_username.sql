-- Add unique constraint for case-insensitive usernames without requiring citext
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx ON profiles (lower(username));
