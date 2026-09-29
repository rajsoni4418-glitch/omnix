-- Omnix Economy & Reward System Schema

-- Core Tables
CREATE TABLE IF NOT EXISTS public.economy_balances (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    omnix_coins INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    highest_streak INTEGER DEFAULT 0,
    last_daily_claim TIMESTAMP WITH TIME ZONE,
    level_id UUID, -- References economy_levels
    experience_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.economy_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Legend'
    required_xp INTEGER NOT NULL,
    daily_bonus_coins INTEGER DEFAULT 0,
    multiplier DECIMAL DEFAULT 1.0,
    badge_icon TEXT,
    frame_url TEXT,
    color_hex TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.economy_balances ADD CONSTRAINT fk_level FOREIGN KEY (level_id) REFERENCES public.economy_levels(id);

CREATE TABLE IF NOT EXISTS public.economy_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'transfer', 'admin', 'refund')),
    source TEXT NOT NULL, -- e.g., 'daily_login', 'post_like', 'shop_purchase', 'gift'
    description TEXT NOT NULL,
    reference_id TEXT, -- UUID or string to reference a post, user, or shop item
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
CREATE INDEX idx_eco_tx_user ON public.economy_transactions(user_id);
CREATE INDEX idx_eco_tx_source ON public.economy_transactions(source);

-- Shop System
CREATE TABLE IF NOT EXISTS public.shop_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- 'Profile', 'Stories', 'Posts', 'OmniClips', 'AI Features', 'Social', 'Exclusive'
    description TEXT,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.shop_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.shop_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    item_type TEXT NOT NULL, -- 'frame', 'badge', 'theme', 'ai_credit', 'sticker', 'filter', 'ticket'
    price INTEGER NOT NULL,
    discount_price INTEGER,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_limited BOOLEAN DEFAULT false,
    available_until TIMESTAMP WITH TIME ZONE,
    required_level_id UUID REFERENCES public.economy_levels(id),
    metadata JSONB, -- stores things like hex colors, effect IDs, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.user_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.shop_items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    is_equipped BOOLEAN DEFAULT false,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, item_id)
);

-- Missions System
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'event', 'creator', 'community')),
    action TEXT NOT NULL, -- 'upload_post', 'watch_story', 'receive_like', etc.
    target_count INTEGER NOT NULL DEFAULT 1,
    reward_coins INTEGER NOT NULL,
    reward_xp INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.user_mission_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
    current_count INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    claimed BOOLEAN DEFAULT false,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL, -- To track daily/weekly resets
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, mission_id, period_start)
);
CREATE INDEX idx_user_mission ON public.user_mission_progress(user_id, mission_id);

-- Daily Limits and Anti-Fraud
CREATE TABLE IF NOT EXISTS public.reward_limits (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    count INTEGER DEFAULT 0,
    max_allowed INTEGER NOT NULL,
    PRIMARY KEY (user_id, action, date)
);

-- Row Level Security (RLS)
ALTER TABLE public.economy_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economy_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economy_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_limits ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own balance" ON public.economy_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view levels" ON public.economy_levels FOR SELECT USING (true);
CREATE POLICY "Users can view their transactions" ON public.economy_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view shop categories" ON public.shop_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view active shop items" ON public.shop_items FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view their inventory" ON public.user_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their equipped items" ON public.user_inventory FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view active missions" ON public.missions FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view their mission progress" ON public.user_mission_progress FOR SELECT USING (auth.uid() = user_id);

-- Initial Data Seed
INSERT INTO public.economy_levels (name, required_xp, daily_bonus_coins, multiplier, color_hex) VALUES
('Bronze', 0, 0, 1.0, '#CD7F32'),
('Silver', 1000, 50, 1.1, '#C0C0C0'),
('Gold', 5000, 150, 1.25, '#FFD700'),
('Platinum', 15000, 300, 1.5, '#E5E4E2'),
('Diamond', 50000, 500, 2.0, '#b9f2ff'),
('Master', 100000, 1000, 2.5, '#ff4081'),
('Legend', 250000, 2500, 3.0, '#9c27b0')
ON CONFLICT DO NOTHING;

INSERT INTO public.shop_categories (name, description, sort_order) VALUES
('Profile', 'Premium frames, badges, and themes', 1),
('Stories', 'Story templates, stickers, and fonts', 2),
('Posts', 'Filters, editing tools, and emojis', 3),
('OmniClips', 'Video effects, voiceovers, and transitions', 4),
('AI Features', 'Generators and AI credits', 5),
('Social', 'Virtual gifts and community features', 6),
('Exclusive', 'Limited edition and seasonal items', 7)
ON CONFLICT DO NOTHING;
