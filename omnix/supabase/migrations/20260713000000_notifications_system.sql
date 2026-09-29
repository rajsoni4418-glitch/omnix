-- Creator Studio & Real-time Notification System Schema
-- Migration: 20260713000000_notifications_system.sql

-- 1. Create Notification Preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    account_activities BOOLEAN DEFAULT true,
    content_engagements BOOLEAN DEFAULT true,
    messages BOOLEAN DEFAULT true,
    communities_events BOOLEAN DEFAULT true,
    rewards_milestones BOOLEAN DEFAULT true,
    system_notifications BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Push Tokens table
CREATE TABLE IF NOT EXISTS public.push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    device_type TEXT NOT NULL DEFAULT 'web', -- 'web', 'ios', 'android'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Notification Logs table for tracing and auditing
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    delivery_channel TEXT NOT NULL, -- 'in_app', 'push', 'email'
    status TEXT DEFAULT 'delivered', -- 'delivered', 'failed', 'pending'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for notification_preferences
DROP POLICY IF EXISTS "Users can view own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can view own notification preferences" 
    ON public.notification_preferences FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can update own notification preferences" 
    ON public.notification_preferences FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can insert own notification preferences" 
    ON public.notification_preferences FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 6. RLS Policies for push_tokens
DROP POLICY IF EXISTS "Users can manage own push tokens" ON public.push_tokens;
CREATE POLICY "Users can manage own push tokens" 
    ON public.push_tokens FOR ALL 
    USING (auth.uid() = user_id);

-- 7. RLS Policies for notification_logs
DROP POLICY IF EXISTS "Users can view own notification logs" ON public.notification_logs;
CREATE POLICY "Users can view own notification logs" 
    ON public.notification_logs FOR SELECT 
    USING (auth.uid() = user_id);

-- 8. Trigger function to auto-create notification preferences for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user_notification_preferences() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger binding
DROP TRIGGER IF EXISTS on_auth_user_created_notification_prefs ON auth.users;
CREATE TRIGGER on_auth_user_created_notification_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_notification_preferences();

-- Insert default notification preferences for existing users
INSERT INTO public.notification_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
