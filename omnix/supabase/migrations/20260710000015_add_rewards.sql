-- Modify profiles to add cosmetic fields
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS current_frame text,
  ADD COLUMN IF NOT EXISTS current_badge text,
  ADD COLUMN IF NOT EXISTS username_color text,
  ADD COLUMN IF NOT EXISTS current_theme text,
  ADD COLUMN IF NOT EXISTS current_story_effect text,
  ADD COLUMN IF NOT EXISTS active_ai_perks jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS omnix_coins bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS experience_points bigint DEFAULT 0;

-- CREATE shop_items table
CREATE TABLE IF NOT EXISTS public.shop_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    title text NOT NULL,
    description text,
    item_type text NOT NULL,
    category text NOT NULL,
    price bigint NOT NULL DEFAULT 0,
    discount_price bigint,
    image_url text,
    icon text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CREATE user_inventory table
CREATE TABLE IF NOT EXISTS public.user_inventory (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    item_id uuid REFERENCES public.shop_items(id) ON DELETE CASCADE NOT NULL,
    acquired_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_equipped boolean DEFAULT false,
    UNIQUE(user_id, item_id)
);

-- CREATE reward_transactions table
CREATE TABLE IF NOT EXISTS public.reward_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount bigint NOT NULL, -- positive for income, negative for expense
    transaction_type text NOT NULL, -- 'purchase', 'mission_reward', 'daily_claim'
    description text NOT NULL,
    reference_id uuid, -- could be item_id or mission_id
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CREATE missions table
CREATE TABLE IF NOT EXISTS public.missions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    type text NOT NULL, -- 'Daily', 'Weekly', 'Creator', 'Event'
    action text NOT NULL, -- e.g., 'watch_clips', 'login'
    target_count integer NOT NULL,
    reward_coins bigint NOT NULL DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CREATE user_mission_progress table
CREATE TABLE IF NOT EXISTS public.user_mission_progress (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    mission_id uuid REFERENCES public.missions(id) ON DELETE CASCADE NOT NULL,
    current_count integer DEFAULT 0,
    is_completed boolean DEFAULT false,
    claimed boolean DEFAULT false,
    last_updated timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, mission_id)
);

-- Initial seed for shop items
INSERT INTO public.shop_items (name, title, item_type, category, price, icon) VALUES
('Neon Purple Frame', 'Neon Purple Frame', 'Profile Frame', 'Profile', 2500, 'Crown'),
('Verified Fan Badge', 'Verified Fan Badge', 'Premium Badge', 'Profile', 5000, 'Medal'),
('Animated Username', 'Animated Username', 'Username Color', 'Profile', 3000, 'Zap'),
('Cyberpunk Theme', 'Cyberpunk Theme', 'Premium Theme', 'Profile', 8000, 'Flame'),
('Pro Story Templates', 'Pro Story Templates', 'Story Templates', 'Stories', 1500, 'Target'),
('AI Story Generator', 'AI Story Generator', 'AI Credits', 'Stories', 2000, 'Zap'),
('Cinematic Filters', 'Cinematic Filters', 'Premium Filters', 'Posts', 1000, 'ShoppingBag'),
('AI Caption Writer', 'AI Caption Writer', 'AI Credits', 'Posts', 1500, 'Zap'),
('Pro Transitions', 'Pro Transitions', 'Video Effects', 'OmniClips', 4000, 'Crown'),
('AI Voiceovers', 'AI Voiceovers', 'AI Credits', 'OmniClips', 3000, 'Zap'),
('100 AI Image Credits', '100 AI Image Credits', 'AI Credits', 'AI Features', 2000, 'Target'),
('AI Avatar Generator', 'AI Avatar Generator', 'AI Tool', 'AI Features', 5000, 'Users'),
('Gift Coins to Creator', 'Gift Coins to Creator', 'Social', 'Social Features', 500, 'Gift'),
('Community VIP Badge', 'Community VIP Badge', 'Social', 'Social Features', 2000, 'Medal'),
('Mystery Box', 'Mystery Box', 'Gacha', 'Exclusive Items', 1000, 'Gift'),
('Lucky Spin Ticket', 'Lucky Spin Ticket', 'Ticket', 'Exclusive Items', 500, 'Target')
ON CONFLICT DO NOTHING;

-- Initial seed for missions
INSERT INTO public.missions (title, type, action, target_count, reward_coins) VALUES
('Log in to Omnix', 'Daily', 'login', 1, 50),
('Watch 5 OmniClips', 'Daily', 'watch_clips', 5, 100),
('Like 10 Posts', 'Daily', 'like_posts', 10, 150),
('Upload a Story', 'Daily', 'upload_story', 1, 200),
('Maintain 7-day Streak', 'Weekly', 'login_streak', 7, 500),
('Receive 50 Likes', 'Weekly', 'receive_likes', 50, 1000),
('Reach 1,000 Views on a Post', 'Creator', 'receive_views', 1000, 500)
ON CONFLICT DO NOTHING;

-- RLS Policies
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mission_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active shop items" ON public.shop_items FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view their own inventory" ON public.user_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own inventory" ON public.user_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own inventory" ON public.user_inventory FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON public.reward_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.reward_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view active missions" ON public.missions FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own mission progress" ON public.user_mission_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own mission progress" ON public.user_mission_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mission progress" ON public.user_mission_progress FOR UPDATE USING (auth.uid() = user_id);
