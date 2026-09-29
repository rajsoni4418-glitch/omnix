-- Omnix Premium Subscription System Schema
-- Migration: 20260714000000_premium_subscription.sql

-- 1. Create Premium Plans table
CREATE TABLE IF NOT EXISTS public.premium_plans (
    id TEXT PRIMARY KEY, -- 'free', 'premium_monthly', 'premium_yearly', 'creator_pro', 'business'
    name TEXT NOT NULL,
    price_monthly NUMERIC NOT NULL DEFAULT 0,
    price_yearly NUMERIC NOT NULL DEFAULT 0,
    features TEXT[] DEFAULT '{}'::TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create User Subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.premium_plans(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'expired', 'past_due'
    billing_period TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly', 'free'
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Subscription History table
CREATE TABLE IF NOT EXISTS public.subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.premium_plans(id) ON DELETE RESTRICT,
    action TEXT NOT NULL, -- 'upgrade', 'downgrade', 'cancel', 'renew', 'expire', 'manual_grant', 'manual_remove'
    amount NUMERIC NOT NULL DEFAULT 0,
    billing_period TEXT NOT NULL, -- 'monthly', 'yearly', 'free'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create Subscription Features table (for granular benefit overrides)
CREATE TABLE IF NOT EXISTS public.subscription_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id TEXT NOT NULL REFERENCES public.premium_plans(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    feature_value TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(plan_id, feature_key)
);

-- 5. Create Subscription Logs table for detailed audit trails
CREATE TABLE IF NOT EXISTS public.subscription_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'subscription_created', 'subscription_canceled', 'subscription_renewed', 'plan_modified', 'benefit_accessed'
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Insert default Premium Plans
INSERT INTO public.premium_plans (id, name, price_monthly, price_yearly, features, is_active)
VALUES 
  ('free', 'Free', 0, 0, ARRAY['Limited Chat', 'Standard Profile', 'Basic Story Fonts'], true),
  ('premium_monthly', 'Premium Monthly', 9.99, 0, ARRAY['Ad-Free Experience', 'Premium Themes', 'Premium Chat Themes', 'Premium Profile Frames', 'Premium Badges', 'Username Colors', 'Premium Story Effects', 'Premium Story Fonts', 'Premium Stickers', 'Premium Emojis', 'Higher Upload Limits', 'Extra Cloud Storage', 'AI Credits (100/mo)', 'Early Access Features', 'Priority Support'], true),
  ('premium_yearly', 'Premium Yearly', 0, 89.99, ARRAY['Ad-Free Experience', 'Premium Themes', 'Premium Chat Themes', 'Premium Profile Frames', 'Animated Frames', 'Premium Badges', 'Username Colors', 'Premium Story Effects', 'Premium Story Fonts', 'Premium Stickers', 'Premium Emojis', 'Higher Upload Limits', 'Extra Cloud Storage', 'AI Credits (150/mo)', 'Early Access Features', 'Priority Support', 'Save 25% Annually'], true),
  ('creator_pro', 'Creator Pro', 29.99, 269.99, ARRAY['All Premium Features', 'Creator Dashboard', 'Analytics Suite', 'Custom Profile Frames', 'Animated Profiles', 'Exclusive Story Stickers', 'Unlimited Story Fonts', 'AI Credits (500/mo)', 'Premium Monetization Tools', 'Direct Fans Support'], true),
  ('business', 'Business', 79.99, 719.99, ARRAY['All Creator Pro Features', 'Commercial License', 'Team Accounts (up to 5)', 'Verified Business Badge', 'Interactive Polls & Q&As', 'Featured Community Listing', 'Custom Stickers Packs', 'AI Credits (Unlimited)', 'Dedicated Account Manager', '24/7 Phone Support'], true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features;

-- 7. Create Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON public.subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_user_id ON public.subscription_logs(user_id);

-- 8. Create Views
CREATE OR REPLACE VIEW public.active_subscribers_view AS
SELECT 
    us.id as subscription_id,
    us.user_id,
    u.username,
    u.email,
    u.full_name,
    us.plan_id,
    p.name as plan_name,
    us.status,
    us.billing_period,
    us.start_date,
    us.current_period_end,
    us.cancel_at_period_end
FROM public.user_subscriptions us
JOIN public.users u ON us.user_id = u.id
JOIN public.premium_plans p ON us.plan_id = p.id;

-- 9. Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_premium_plans_updated_at
    BEFORE UPDATE ON public.premium_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. RPC Functions for Subscription Management
CREATE OR REPLACE FUNCTION public.grant_manual_premium(
    target_user_id UUID,
    target_plan_id TEXT,
    duration_days INTEGER
)
RETURNS VOID AS $$
DECLARE
    expiry_time TIMESTAMP WITH TIME ZONE;
BEGIN
    expiry_time := now() + (duration_days || ' days')::INTERVAL;
    
    INSERT INTO public.user_subscriptions (user_id, plan_id, status, billing_period, start_date, current_period_end, cancel_at_period_end)
    VALUES (target_user_id, target_plan_id, 'active', 'monthly', now(), expiry_time, false)
    ON CONFLICT (user_id) DO UPDATE SET
        plan_id = EXCLUDED.plan_id,
        status = 'active',
        current_period_end = expiry_time,
        cancel_at_period_end = false,
        updated_at = now();

    INSERT INTO public.subscription_history (user_id, plan_id, action, amount, billing_period)
    VALUES (target_user_id, target_plan_id, 'manual_grant', 0, 'monthly');

    INSERT INTO public.subscription_logs (user_id, event_type, details)
    VALUES (target_user_id, 'plan_modified', 'Manual premium grant of plan ' || target_plan_id || ' for ' || duration_days || ' days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.remove_user_premium(
    target_user_id UUID
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.user_subscriptions
    SET plan_id = 'free',
        status = 'active',
        current_period_end = NULL,
        cancel_at_period_end = false,
        updated_at = now()
    WHERE user_id = target_user_id;

    INSERT INTO public.subscription_history (user_id, plan_id, action, amount, billing_period)
    VALUES (target_user_id, 'free', 'manual_remove', 0, 'free');

    INSERT INTO public.subscription_logs (user_id, event_type, details)
    VALUES (target_user_id, 'plan_modified', 'Manual premium removal back to Free plan');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.premium_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_logs ENABLE ROW LEVEL SECURITY;

-- 12. RLS Policies
-- Plans: Anyone can view active plans, only admins can modify
CREATE POLICY "Anyone can view active plans" 
    ON public.premium_plans FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Admins can modify plans" 
    ON public.premium_plans FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Subscriptions: Users can view and manage their own subscriptions
CREATE POLICY "Users can view own subscription" 
    ON public.user_subscriptions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" 
    ON public.user_subscriptions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" 
    ON public.user_subscriptions FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" 
    ON public.user_subscriptions FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- History: Users can view own history
CREATE POLICY "Users can view own subscription history" 
    ON public.subscription_history FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all history" 
    ON public.subscription_history FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Features: Anyone can view features
CREATE POLICY "Anyone can view subscription features" 
    ON public.subscription_features FOR SELECT 
    USING (true);

-- Logs: Only admins can view logs, users can insert own logs
CREATE POLICY "Admins can view all subscription logs" 
    ON public.subscription_logs FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can insert own subscription logs" 
    ON public.subscription_logs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
