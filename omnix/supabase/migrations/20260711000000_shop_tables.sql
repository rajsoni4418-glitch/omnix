-- Drop existing tables to recreate them properly
DROP TABLE IF EXISTS public.reward_shop_items CASCADE;
DROP TABLE IF EXISTS public.shop_items CASCADE;

-- Create the shop_items table
CREATE TABLE IF NOT EXISTS public.shop_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    item_type TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Shop items are viewable by everyone" ON public.shop_items
    FOR SELECT USING (true);

-- Insert the requested items
INSERT INTO public.shop_items (name, title, item_type, category, price, icon) VALUES
('Neon Purple Frame', 'Neon Purple Frame', 'Profile Frame', 'Profile', 2500, 'Crown'),
('Verified Fan Badge', 'Verified Fan Badge', 'Premium Badge', 'Profile', 5000, 'Medal'),
('Animated Username', 'Animated Username', 'Username Color', 'Username', 3000, 'Zap'),
('Cyberpunk Theme', 'Cyberpunk Theme', 'Premium Theme', 'Themes', 8000, 'Flame'),
('Pro Story Templates', 'Pro Story Templates', 'Story Templates', 'Stories', 1500, 'Target'),
('AI Story Generator', 'AI Story Generator', 'AI Credits', 'Stories', 2000, 'Zap'),
('Cinematic Filters', 'Cinematic Filters', 'Premium Filters', 'Posts', 1000, 'ShoppingBag'),
('AI Caption Writer', 'AI Caption Writer', 'AI Credits', 'Posts', 1500, 'Zap'),
('Pro Transitions', 'Pro Transitions', 'Video Effects', 'OmniClips', 4000, 'Crown'),
('AI Voiceovers', 'AI Voiceovers', 'AI Credits', 'OmniClips', 3000, 'Zap'),
('100 AI Image Credits', '100 AI Image Credits', 'AI Credits', 'AI Features', 2000, 'Target'),
('AI Avatar Generator', 'AI Avatar Generator', 'AI Tool', 'AI Features', 5000, 'Users'),
('Gift Coins to Creator', 'Gift Coins to Creator', 'Social', 'Social', 500, 'Gift'),
('Community VIP Badge', 'Community VIP Badge', 'Social', 'Social', 2000, 'Medal'),
('Mystery Box', 'Mystery Box', 'Gacha', 'Premium', 1000, 'Gift'),
('Lucky Spin Ticket', 'Lucky Spin Ticket', 'Ticket', 'Premium', 500, 'Target'),
('Golden Creator Badge', 'Golden Creator Badge', 'Creator Badge', 'Creator', 10000, 'Star'),
('Video Effects Pack', 'Video Effects Pack', 'Effects', 'Effects', 3500, 'Flame');

