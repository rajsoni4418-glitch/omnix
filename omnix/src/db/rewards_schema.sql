-- Rewards System Schema

-- User Rewards Profile
CREATE TABLE IF NOT EXISTS public.user_rewards (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    coin_balance INTEGER DEFAULT 0,
    total_coins_earned INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    highest_streak INTEGER DEFAULT 0,
    last_login_date DATE,
    level_name TEXT DEFAULT 'Bronze',
    level_progress INTEGER DEFAULT 0,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Reward Transactions
CREATE TABLE IF NOT EXISTS public.reward_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL, -- 'earn', 'spend'
    description TEXT NOT NULL,
    reference_id TEXT, -- e.g., mission_id, shop_item_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Missions
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    mission_type TEXT NOT NULL, -- 'daily', 'weekly', 'one_time', 'creator'
    reward_coins INTEGER NOT NULL,
    requirement_count INTEGER DEFAULT 1,
    action_type TEXT NOT NULL, -- 'login', 'post', 'like', 'comment', etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- User Missions
CREATE TABLE IF NOT EXISTS public.user_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    reset_at TIMESTAMP WITH TIME ZONE, -- For daily/weekly resets
    UNIQUE(user_id, mission_id, reset_at)
);

-- Achievements
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    required_level TEXT,
    reward_coins INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- User Achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, achievement_id)
);

-- Reward Shop Items
CREATE TABLE IF NOT EXISTS public.reward_shop_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    item_type TEXT NOT NULL, -- 'badge', 'frame', 'theme', 'credits'
    cost INTEGER NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- User Inventory
CREATE TABLE IF NOT EXISTS public.user_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.reward_shop_items(id) ON DELETE CASCADE,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    is_equipped BOOLEAN DEFAULT false
);

-- RLS Policies
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

-- Add basic select policies for authenticated users
CREATE POLICY "Users can view their own rewards" ON public.user_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their transactions" ON public.reward_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active missions" ON public.missions FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view their mission progress" ON public.user_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Users can view their unlocked achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active shop items" ON public.reward_shop_items FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view their inventory" ON public.user_inventory FOR SELECT USING (auth.uid() = user_id);
