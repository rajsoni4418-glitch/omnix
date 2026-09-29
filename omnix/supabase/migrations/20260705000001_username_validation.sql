-- Migration: Add backend validation for username formatting
-- This trigger ensures new usernames or updated usernames meet the criteria,
-- while allowing existing usernames to continue working unchanged.

CREATE OR REPLACE FUNCTION validate_username()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate if it's a new insert or the username is changing
  IF TG_OP = 'INSERT' OR NEW.username <> OLD.username THEN
    
    IF length(NEW.username) < 3 OR length(NEW.username) > 30 THEN
      RAISE EXCEPTION 'Username must be between 3 and 30 characters';
    END IF;
    
    -- Allowed: letters (a-z, A-Z), numbers (0-9), underscore (_), dot (.), hyphen (-), apostrophe (')
    IF NEW.username !~ '^[a-zA-Z0-9_.''-]+$' THEN
      RAISE EXCEPTION 'Username contains invalid characters';
    END IF;
    
    -- Cannot start or end with: . _ - '
    IF NEW.username ~ '^[._''-]' OR NEW.username ~ '[._''-]$' THEN
      RAISE EXCEPTION 'Username cannot start or end with a special character';
    END IF;
    
    -- Cannot contain consecutive special characters (e.g. .. __ -- '' ._ etc)
    IF NEW.username ~ '[._''-]{2,}' THEN
      RAISE EXCEPTION 'Username cannot contain consecutive special characters';
    END IF;
    
    -- Reserved usernames
    IF lower(NEW.username) IN ('admin', 'support', 'omnix', 'official', 'verified', 'security', 'system') THEN
      RAISE EXCEPTION 'This username is reserved';
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_username_trigger ON profiles;
CREATE TRIGGER validate_username_trigger
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION validate_username();
