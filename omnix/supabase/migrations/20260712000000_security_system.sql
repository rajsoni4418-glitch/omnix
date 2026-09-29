-- User Security Settings
CREATE TABLE IF NOT EXISTS public.user_security_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    require_2fa BOOLEAN DEFAULT false,
    email_alerts_new_device BOOLEAN DEFAULT true,
    email_alerts_new_location BOOLEAN DEFAULT true,
    login_rate_limit_enabled BOOLEAN DEFAULT true,
    is_private_account BOOLEAN DEFAULT false,
    hide_online_status BOOLEAN DEFAULT false,
    hide_last_seen BOOLEAN DEFAULT false,
    hide_followers BOOLEAN DEFAULT false,
    hide_stories_from UUID[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Login History
CREATE TABLE IF NOT EXISTS public.login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID,
    device_name TEXT,
    browser TEXT,
    os TEXT,
    ip_address TEXT,
    location TEXT,
    is_success BOOLEAN DEFAULT true,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    logout_time TIMESTAMP WITH TIME ZONE
);

-- Blocked Users
CREATE TABLE IF NOT EXISTS public.user_blocks (
    blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (blocker_id, blocked_id)
);

-- RLS Policies
ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- Policies for user_security_settings
CREATE POLICY "Users can view own security settings" 
    ON public.user_security_settings FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own security settings" 
    ON public.user_security_settings FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own security settings" 
    ON public.user_security_settings FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policies for login_history
CREATE POLICY "Users can view own login history" 
    ON public.login_history FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own login history" 
    ON public.login_history FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policies for user_blocks
CREATE POLICY "Users can view own blocks" 
    ON public.user_blocks FOR SELECT 
    USING (auth.uid() = blocker_id);

CREATE POLICY "Users can insert own blocks" 
    ON public.user_blocks FOR INSERT 
    WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete own blocks" 
    ON public.user_blocks FOR DELETE 
    USING (auth.uid() = blocker_id);

-- Function to handle new user signup for security settings
CREATE OR REPLACE FUNCTION public.handle_new_user_security() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_security_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created_security ON auth.users;
CREATE TRIGGER on_auth_user_created_security
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_security();

-- Insert settings for existing users
INSERT INTO public.user_security_settings (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

