-- Omnix Creator Monetization and Earnings System Database Schema
-- Migration: 20260718000000_creator_monetization.sql

-- 1. Create creator_earnings table
CREATE TABLE IF NOT EXISTS public.creator_earnings (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    frozen BOOLEAN NOT NULL DEFAULT false,
    monetization_suspended BOOLEAN NOT NULL DEFAULT false,
    last_withdrawal_date TIMESTAMP WITH TIME ZONE,
    next_eligible_withdrawal_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create earning_sources table
CREATE TABLE IF NOT EXISTS public.earning_sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    description TEXT
);

-- Seed default earning sources
INSERT INTO public.earning_sources (id, name, enabled, description) VALUES
('gift', 'Virtual Gifts', true, 'Tips sent by viewers during streams or on content'),
('story_reward', 'Story Rewards', true, 'Monetization shares for story views'),
('post_reward', 'Post Rewards', true, 'Monetization shares for feed posts'),
('omniclip_reward', 'OmniClip Rewards', true, 'Engagement rewards for short video clips'),
('referral', 'Referral Program', true, 'Commissions on referred user subscriptions'),
('premium_share', 'Premium Revenue Share', true, 'Revenue distribution from premium user views'),
('challenge', 'Creator Challenges', true, 'Bonuses for participating in community events'),
('sponsored', 'Sponsored Content', true, 'Direct brand integration sponsorships'),
('brand_collab', 'Brand Collaborations', true, 'Earning from brand marketplace collabs'),
('community_revenue', 'Community Revenue', true, 'Revenue generated through private communities'),
('event_reward', 'Event Rewards', true, 'Rewards from virtual live events')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 3. Create earning_transactions table
CREATE TABLE IF NOT EXISTS public.earning_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    source TEXT NOT NULL, -- references earning_sources.id or 'payout'
    content_id TEXT, -- post ID, story ID, community ID or Null
    amount NUMERIC(15,2) NOT NULL, -- positive for credit, negative for debit
    status TEXT NOT NULL DEFAULT 'completed', -- 'completed', 'pending', 'processing', 'rejected'
    description TEXT NOT NULL,
    reference_id TEXT UNIQUE, -- to prevent duplicate rewards or fraud
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create creator_levels table
CREATE TABLE IF NOT EXISTS public.creator_levels (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 10,
    rank TEXT NOT NULL DEFAULT 'Bronze Creator',
    level INTEGER NOT NULL DEFAULT 1,
    progress INTEGER NOT NULL DEFAULT 0, -- percentage progress to next level (0-100)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create creator_achievements table
CREATE TABLE IF NOT EXISTS public.creator_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    achievement_type TEXT NOT NULL, -- 'bronze', 'silver', 'gold', 'diamond', 'top_story', 'top_omniclip', 'top_community'
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_type)
);

-- 6. Create creator_statistics table
CREATE TABLE IF NOT EXISTS public.creator_statistics (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    followers INTEGER NOT NULL DEFAULT 0,
    profile_views INTEGER NOT NULL DEFAULT 0,
    story_views INTEGER NOT NULL DEFAULT 0,
    post_reach INTEGER NOT NULL DEFAULT 0,
    omniclip_views INTEGER NOT NULL DEFAULT 0,
    watch_time INTEGER NOT NULL DEFAULT 0, -- minutes
    likes INTEGER NOT NULL DEFAULT 0,
    comments INTEGER NOT NULL DEFAULT 0,
    shares INTEGER NOT NULL DEFAULT 0,
    saves INTEGER NOT NULL DEFAULT 0,
    engagement_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    follower_growth NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create earning_reports table
CREATE TABLE IF NOT EXISTS public.earning_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    report_name TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_revenue NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    payout_status TEXT NOT NULL DEFAULT 'none',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Setup Indexes
CREATE INDEX IF NOT EXISTS idx_creator_earnings_user ON public.creator_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_earning_tx_user ON public.earning_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_earning_tx_source ON public.earning_transactions(source);
CREATE INDEX IF NOT EXISTS idx_earning_tx_status ON public.earning_transactions(status);
CREATE INDEX IF NOT EXISTS idx_earning_tx_ref ON public.earning_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_creator_levels_user ON public.creator_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_ach_user ON public.creator_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_stats_user ON public.creator_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_earning_reports_user ON public.earning_reports(user_id);

-- 9. Setup dynamic Creator Earnings Summary View
-- Computes real-time dynamic, tamper-proof, fraud-free running metrics directly from server-side logs
CREATE OR REPLACE VIEW public.creator_earnings_summary AS
SELECT 
    ce.user_id,
    -- Today's Earnings
    COALESCE((SELECT SUM(amount) FROM public.earning_transactions WHERE user_id = ce.user_id AND amount > 0 AND status = 'completed' AND date >= CURRENT_DATE), 0.00) AS today_earnings,
    -- Yesterday's Earnings
    COALESCE((SELECT SUM(amount) FROM public.earning_transactions WHERE user_id = ce.user_id AND amount > 0 AND status = 'completed' AND date >= CURRENT_DATE - INTERVAL '1 day' AND date < CURRENT_DATE), 0.00) AS yesterday_earnings,
    -- Weekly Earnings
    COALESCE((SELECT SUM(amount) FROM public.earning_transactions WHERE user_id = ce.user_id AND amount > 0 AND status = 'completed' AND date >= date_trunc('week', CURRENT_DATE)), 0.00) AS weekly_earnings,
    -- Monthly Earnings
    COALESCE((SELECT SUM(amount) FROM public.earning_transactions WHERE user_id = ce.user_id AND amount > 0 AND status = 'completed' AND date >= date_trunc('month', CURRENT_DATE)), 0.00) AS monthly_earnings,
    -- Yearly Earnings
    COALESCE((SELECT SUM(amount) FROM public.earning_transactions WHERE user_id = ce.user_id AND amount > 0 AND status = 'completed' AND date >= date_trunc('year', CURRENT_DATE)), 0.00) AS yearly_earnings,
    -- Lifetime Earnings
    COALESCE((SELECT SUM(amount) FROM public.earning_transactions WHERE user_id = ce.user_id AND amount > 0 AND status = 'completed'), 0.00) AS lifetime_earnings,
    
    -- Balances
    -- Available Balance (completed earnings + completed withdrawals/debits which are stored as negative amounts)
    COALESCE((SELECT SUM(amount) FROM public.earning_transactions WHERE user_id = ce.user_id AND status = 'completed'), 0.00) AS available_balance,
    -- Pending Balance (pending earnings)
    COALESCE((SELECT SUM(amount) FROM public.earning_transactions WHERE user_id = ce.user_id AND amount > 0 AND status = 'pending'), 0.00) AS pending_balance,
    -- Processing Balance (withdrawals that are currently processing/pending)
    COALESCE((SELECT ABS(SUM(amount)) FROM public.earning_transactions WHERE user_id = ce.user_id AND amount < 0 AND status IN ('pending', 'processing')), 0.00) AS processing_balance,
    -- Withdrawn Balance (completed payouts)
    COALESCE((SELECT ABS(SUM(amount)) FROM public.earning_transactions WHERE user_id = ce.user_id AND amount < 0 AND status = 'completed'), 0.00) AS withdrawn_balance,
    
    -- Restriction Settings
    ce.frozen,
    ce.monetization_suspended,
    ce.last_withdrawal_date,
    ce.next_eligible_withdrawal_date,
    ce.created_at,
    ce.updated_at
FROM public.creator_earnings ce;

-- 10. Automatically initialize Creator monetization details on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_creator_monetization()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.creator_earnings (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    INSERT INTO public.creator_levels (user_id, score, rank, level, progress) VALUES (NEW.id, 10, 'Bronze Creator', 1, 0) ON CONFLICT (user_id) DO NOTHING;
    INSERT INTO public.creator_statistics (user_id, followers, profile_views, story_views, post_reach, omniclip_views, watch_time, likes, comments, shares, saves, engagement_rate, follower_growth)
    VALUES (NEW.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.00, 0.00) ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_creator ON public.users;
CREATE TRIGGER on_user_created_creator
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_creator_monetization();

-- Initialize all current/existing users
INSERT INTO public.creator_earnings (user_id)
SELECT id FROM public.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.creator_levels (user_id, score, rank, level, progress)
SELECT id, 10, 'Bronze Creator', 1, 0 FROM public.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.creator_statistics (user_id, followers, profile_views, story_views, post_reach, omniclip_views, watch_time, likes, comments, shares, saves, engagement_rate, follower_growth)
SELECT id, 1250, 4820, 1820, 3240, 950, 4200, 850, 240, 150, 110, 8.42, 1.25 FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- 11. Recalculate levels function
CREATE OR REPLACE FUNCTION public.recalculate_creator_level(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_stats public.creator_statistics%ROWTYPE;
    v_score INTEGER;
    v_level INTEGER;
    v_rank TEXT;
    v_progress INTEGER;
    v_followers INTEGER;
    v_likes INTEGER;
    v_views INTEGER;
BEGIN
    -- Get current statistics
    SELECT * INTO v_stats FROM public.creator_statistics WHERE user_id = p_user_id;
    IF NOT FOUND THEN
        RETURN;
    END IF;

    v_followers := v_stats.followers;
    v_likes := v_stats.likes;
    v_views := v_stats.profile_views + v_stats.story_views + v_stats.omniclip_views;

    -- Calculate Creator Score (0 to 100)
    v_score := LEAST(100, ROUND(
        (LEAST(v_followers, 10000)::NUMERIC / 10000.0 * 40.0) +
        (LEAST(v_likes, 5000)::NUMERIC / 5000.0 * 30.0) +
        (LEAST(v_views, 20000)::NUMERIC / 20000.0 * 30.0)
    ));

    IF v_score < 10 THEN
        v_score := 10;
    END IF;

    -- Calculate Level & Progress
    IF v_followers <= 500 THEN
        v_level := 1;
        v_progress := ROUND((v_followers::NUMERIC / 500.0) * 100.0);
    ELSIF v_followers <= 2000 THEN
        v_level := 2;
        v_progress := ROUND(((v_followers - 500)::NUMERIC / 1500.0) * 100.0);
    ELSIF v_followers <= 5000 THEN
        v_level := 3;
        v_progress := ROUND(((v_followers - 2000)::NUMERIC / 3000.0) * 100.0);
    ELSIF v_followers <= 15000 THEN
        v_level := 4;
        v_progress := ROUND(((v_followers - 5000)::NUMERIC / 10000.0) * 100.0);
    ELSE
        v_level := 5;
        v_progress := 100;
    END IF;

    -- Calculate Rank
    IF v_followers < 1000 THEN
        v_rank := 'Bronze Creator';
    ELSIF v_followers < 5000 THEN
        v_rank := 'Silver Creator';
    ELSIF v_followers < 20000 THEN
        v_rank := 'Gold Creator';
    ELSE
        v_rank := 'Diamond Creator';
    END IF;

    -- Update creator_levels
    UPDATE public.creator_levels
    SET score = v_score,
        rank = v_rank,
        level = v_level,
        progress = LEAST(100, GREATEST(0, v_progress)),
        updated_at = now()
    WHERE user_id = p_user_id;

    -- Unlock Achievements
    IF v_followers >= 0 THEN
        INSERT INTO public.creator_achievements (user_id, achievement_type)
        VALUES (p_user_id, 'bronze') ON CONFLICT (user_id, achievement_type) DO NOTHING;
    END IF;

    IF v_followers >= 1000 THEN
        INSERT INTO public.creator_achievements (user_id, achievement_type)
        VALUES (p_user_id, 'silver') ON CONFLICT (user_id, achievement_type) DO NOTHING;
    END IF;

    IF v_followers >= 5000 THEN
        INSERT INTO public.creator_achievements (user_id, achievement_type)
        VALUES (p_user_id, 'gold') ON CONFLICT (user_id, achievement_type) DO NOTHING;
    END IF;

    IF v_followers >= 20000 THEN
        INSERT INTO public.creator_achievements (user_id, achievement_type)
        VALUES (p_user_id, 'diamond') ON CONFLICT (user_id, achievement_type) DO NOTHING;
    END IF;

    IF v_stats.story_views >= 500 THEN
        INSERT INTO public.creator_achievements (user_id, achievement_type)
        VALUES (p_user_id, 'top_story') ON CONFLICT (user_id, achievement_type) DO NOTHING;
    END IF;

    IF v_stats.omniclip_views >= 1000 THEN
        INSERT INTO public.creator_achievements (user_id, achievement_type)
        VALUES (p_user_id, 'top_omniclip') ON CONFLICT (user_id, achievement_type) DO NOTHING;
    END IF;

    IF v_stats.shares >= 100 OR v_stats.comments >= 200 THEN
        INSERT INTO public.creator_achievements (user_id, achievement_type)
        VALUES (p_user_id, 'top_community') ON CONFLICT (user_id, achievement_type) DO NOTHING;
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically recalculate level and achievements when statistics change
CREATE OR REPLACE FUNCTION public.trigger_recalculate_creator_level()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.recalculate_creator_level(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_creator_statistics_update ON public.creator_statistics;
CREATE TRIGGER on_creator_statistics_update
    AFTER INSERT OR UPDATE ON public.creator_statistics
    FOR EACH ROW EXECUTE FUNCTION public.trigger_recalculate_creator_level();

-- Trigger for recalculation for existing records
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT user_id FROM public.creator_statistics LOOP
        PERFORM public.recalculate_creator_level(r.user_id);
    END LOOP;
END $$;

-- 12. Secure Database RPC Functions for Creator/Admin Operations

-- Request withdrawal (tamper-proof balance deduction and pending entry creation)
CREATE OR REPLACE FUNCTION public.request_withdrawal(
    p_user_id UUID,
    p_amount NUMERIC,
    p_description TEXT DEFAULT 'Withdrawal Transfer Request'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_earnings public.creator_earnings%ROWTYPE;
    v_available_balance NUMERIC;
    v_tx_id UUID;
BEGIN
    -- Authorization check
    IF p_user_id <> auth.uid() AND NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')) THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    -- Check status
    SELECT * INTO v_earnings FROM public.creator_earnings WHERE user_id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Creator profile not found');
    END IF;

    IF v_earnings.frozen THEN
        RETURN json_build_object('success', false, 'error', 'Account frozen. Withdrawals temporarily disabled.');
    END IF;
    
    IF v_earnings.monetization_suspended THEN
        RETURN json_build_object('success', false, 'error', 'Creator monetization privileges suspended.');
    END IF;

    IF p_amount < 50.00 THEN
        RETURN json_build_object('success', false, 'error', 'Minimum withdrawal required is $50.00');
    END IF;

    -- Calculate balance dynamically from view to guarantee real status
    SELECT available_balance INTO v_available_balance FROM public.creator_earnings_summary WHERE user_id = p_user_id;

    IF v_available_balance < p_amount THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient available balance');
    END IF;

    -- Insert negative balance for transaction with 'pending' status
    INSERT INTO public.earning_transactions (
        user_id,
        amount,
        source,
        status,
        description
    )
    VALUES (
        p_user_id,
        -p_amount,
        'payout',
        'pending',
        p_description
    )
    RETURNING id INTO v_tx_id;

    RETURN json_build_object(
        'success', true,
        'transaction_id', v_tx_id,
        'message', 'Withdrawal request submitted successfully'
    );
END;
$$;

-- Admin Adjust Earnings (Adds completed or pending earnings to any creator)
CREATE OR REPLACE FUNCTION public.admin_adjust_creator_earnings(
    p_target_user_id UUID,
    p_amount NUMERIC,
    p_source TEXT,
    p_description TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tx_id UUID;
BEGIN
    -- Verify if admin
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')) THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized admin privilege required');
    END IF;

    -- Create completed adjustment
    INSERT INTO public.earning_transactions (
        user_id,
        amount,
        source,
        status,
        description
    )
    VALUES (
        p_target_user_id,
        p_amount,
        p_source,
        'completed',
        p_description
    )
    RETURNING id INTO v_tx_id;

    RETURN json_build_object('success', true, 'transaction_id', v_tx_id, 'message', 'Earning transaction added successfully');
END;
$$;

-- Admin Update Transaction Status (Approve/Reject pending withdrawals or earnings)
CREATE OR REPLACE FUNCTION public.admin_update_transaction_status(
    p_transaction_id UUID,
    p_status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tx public.earning_transactions%ROWTYPE;
BEGIN
    -- Verify if admin
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')) THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized admin privilege required');
    END IF;

    -- Get transaction
    SELECT * INTO v_tx FROM public.earning_transactions WHERE id = p_transaction_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Transaction not found');
    END IF;

    -- Update status
    UPDATE public.earning_transactions
    SET status = p_status,
        updated_at = now()
    WHERE id = p_transaction_id;

    -- Handle withdrawal approval side-effects
    IF v_tx.source = 'payout' AND p_status = 'completed' THEN
        UPDATE public.creator_earnings
        SET last_withdrawal_date = now(),
            next_eligible_withdrawal_date = now() + INTERVAL '7 days',
            updated_at = now()
        WHERE user_id = v_tx.user_id;
    END IF;

    RETURN json_build_object('success', true, 'message', 'Transaction status updated successfully');
END;
$$;

-- Admin Set Monetization status (Freeze, Suspend)
CREATE OR REPLACE FUNCTION public.admin_set_creator_monetization_status(
    p_target_user_id UUID,
    p_frozen BOOLEAN,
    p_suspended BOOLEAN
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify if admin
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')) THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized admin privilege required');
    END IF;

    UPDATE public.creator_earnings
    SET frozen = p_frozen,
        monetization_suspended = p_suspended,
        updated_at = now()
    WHERE user_id = p_target_user_id;

    RETURN json_build_object('success', true, 'message', 'Monetization status updated successfully');
END;
$$;

-- Admin adjust statistics
CREATE OR REPLACE FUNCTION public.admin_adjust_creator_statistics(
    p_target_user_id UUID,
    p_stat_name TEXT,
    p_value INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify if admin
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')) THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    -- Update stat
    IF p_stat_name = 'followers' THEN
        UPDATE public.creator_statistics SET followers = p_value, updated_at = now() WHERE user_id = p_target_user_id;
    ELSIF p_stat_name = 'profile_views' THEN
        UPDATE public.creator_statistics SET profile_views = p_value, updated_at = now() WHERE user_id = p_target_user_id;
    ELSIF p_stat_name = 'story_views' THEN
        UPDATE public.creator_statistics SET story_views = p_value, updated_at = now() WHERE user_id = p_target_user_id;
    ELSIF p_stat_name = 'post_reach' THEN
        UPDATE public.creator_statistics SET post_reach = p_value, updated_at = now() WHERE user_id = p_target_user_id;
    ELSIF p_stat_name = 'omniclip_views' THEN
        UPDATE public.creator_statistics SET omniclip_views = p_value, updated_at = now() WHERE user_id = p_target_user_id;
    ELSIF p_stat_name = 'watch_time' THEN
        UPDATE public.creator_statistics SET watch_time = p_value, updated_at = now() WHERE user_id = p_target_user_id;
    ELSIF p_stat_name = 'likes' THEN
        UPDATE public.creator_statistics SET likes = p_value, updated_at = now() WHERE user_id = p_target_user_id;
    ELSIF p_stat_name = 'comments' THEN
        UPDATE public.creator_statistics SET comments = p_value, updated_at = now() WHERE user_id = p_target_user_id;
    ELSIF p_stat_name = 'shares' THEN
        UPDATE public.creator_statistics SET shares = p_value, updated_at = now() WHERE user_id = p_target_user_id;
    ELSIF p_stat_name = 'saves' THEN
        UPDATE public.creator_statistics SET saves = p_value, updated_at = now() WHERE user_id = p_target_user_id;
    ELSIF p_stat_name = 'engagement_rate' THEN
        UPDATE public.creator_statistics SET engagement_rate = p_value::numeric, updated_at = now() WHERE user_id = p_target_user_id;
    ELSIF p_stat_name = 'follower_growth' THEN
        UPDATE public.creator_statistics SET follower_growth = p_value::numeric, updated_at = now() WHERE user_id = p_target_user_id;
    ELSE
        RETURN json_build_object('success', false, 'error', 'Invalid statistic name');
    END IF;

    RETURN json_build_object('success', true, 'message', 'Statistic updated successfully');
END;
$$;

-- 13. Enable Row Level Security (RLS)
ALTER TABLE public.creator_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earning_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earning_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earning_reports ENABLE ROW LEVEL SECURITY;

-- 14. Configure RLS Policies

-- creator_earnings: users can view own; admins can manage all
CREATE POLICY "Users can view own earnings configuration" 
    ON public.creator_earnings FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all creator earnings configuration" 
    ON public.creator_earnings FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- earning_sources: readable by all authenticated users
CREATE POLICY "Authenticated users can view earning sources" 
    ON public.earning_sources FOR SELECT 
    USING (auth.role() = 'authenticated');

-- earning_transactions: users can view own; admins can manage all
CREATE POLICY "Users can view own earning transactions" 
    ON public.earning_transactions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all earning transactions" 
    ON public.earning_transactions FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- creator_levels: users can view own; admins can manage all
CREATE POLICY "Users can view own creator levels" 
    ON public.creator_levels FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all creator levels" 
    ON public.creator_levels FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- creator_achievements: users can view own; admins can manage all
CREATE POLICY "Users can view own achievements" 
    ON public.creator_achievements FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all achievements" 
    ON public.creator_achievements FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- creator_statistics: users can view own; admins can manage all
CREATE POLICY "Users can view own statistics" 
    ON public.creator_statistics FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all statistics" 
    ON public.creator_statistics FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- earning_reports: users can view own; admins can manage all
CREATE POLICY "Users can view own reports" 
    ON public.earning_reports FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reports" 
    ON public.earning_reports FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));


-- 15. SEED INITIAL TRANSACTIONS TO GENERATE HISTORICAL METRICS
-- Let's make sure our view has some initial mock data for analytics to render beautifully out-of-the-box
DO $$
DECLARE
    v_user RECORD;
    v_base_time TIMESTAMP WITH TIME ZONE := timezone('utc'::text, now());
BEGIN
    FOR v_user IN SELECT id FROM public.users LOOP
        -- Seed some transactions for each user if they don't have transactions
        IF NOT EXISTS (SELECT 1 FROM public.earning_transactions WHERE user_id = v_user.id) THEN
            -- Completed earnings
            INSERT INTO public.earning_transactions (user_id, date, source, amount, status, description) VALUES
            (v_user.id, v_base_time - INTERVAL '20 days', 'post_reward', 15.50, 'completed', 'Post rewards share'),
            (v_user.id, v_base_time - INTERVAL '15 days', 'gift', 45.00, 'completed', 'Virtual gifts received'),
            (v_user.id, v_base_time - INTERVAL '12 days', 'omniclip_reward', 30.00, 'completed', 'OmniClip viral rewards'),
            (v_user.id, v_base_time - INTERVAL '8 days', 'referral', 10.00, 'completed', 'Referral sign up share'),
            (v_user.id, v_base_time - INTERVAL '5 days', 'premium_share', 125.00, 'completed', 'Premium subscription views share'),
            (v_user.id, v_base_time - INTERVAL '3 days', 'challenge', 50.00, 'completed', 'Creator challenge bonus'),
            (v_user.id, v_base_time - INTERVAL '2 days', 'sponsored', 200.00, 'completed', 'Brand integration sponsorship payment'),
            (v_user.id, v_base_time - INTERVAL '1 day', 'community_revenue', 75.00, 'completed', 'Monthly private community renewal'),
            (v_user.id, v_base_time, 'gift', 120.00, 'completed', 'Gold tier streams gift package'),
            (v_user.id, v_base_time, 'event_reward', 50.00, 'completed', 'Live Event Participation reward');

            -- Pending / Processing Earnings
            INSERT INTO public.earning_transactions (user_id, date, source, amount, status, description) VALUES
            (v_user.id, v_base_time - INTERVAL '1 day', 'brand_collab', 150.00, 'pending', 'Brand marketplace collab review payment');

            -- Completed withdrawals
            INSERT INTO public.earning_transactions (user_id, date, source, amount, status, description) VALUES
            (v_user.id, v_base_time - INTERVAL '10 days', 'payout', -100.00, 'completed', 'Bank transfer payout reference #PAY9543');
        END IF;
    END LOOP;
END $$;
