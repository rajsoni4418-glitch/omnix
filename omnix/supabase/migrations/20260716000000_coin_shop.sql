-- Omnix Coin Shop Schema
-- Migration: 20260716000000_coin_shop.sql

-- 1. Create Coin Packs table
CREATE TABLE IF NOT EXISTS public.coin_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    coins INTEGER NOT NULL CHECK (coins >= 0),
    price NUMERIC NOT NULL CHECK (price >= 0),
    bonus_coins INTEGER NOT NULL DEFAULT 0 CHECK (bonus_coins >= 0),
    tag TEXT DEFAULT NULL, -- 'featured', 'popular', 'best_value'
    pack_type TEXT NOT NULL DEFAULT 'standard' CHECK (pack_type IN ('standard', 'festival', 'limited', 'creator')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Coin Coupons table
CREATE TABLE IF NOT EXISTS public.coin_coupons (
    code TEXT PRIMARY KEY,
    discount_percent NUMERIC NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Coin Offers / Campaigns table
CREATE TABLE IF NOT EXISTS public.coin_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID REFERENCES public.coin_packs(id) ON DELETE CASCADE,
    discount_percent NUMERIC NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    extra_bonus_percent NUMERIC NOT NULL DEFAULT 0 CHECK (extra_bonus_percent >= 0),
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create Coin Purchases table
CREATE TABLE IF NOT EXISTS public.coin_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    pack_id UUID REFERENCES public.coin_packs(id) ON DELETE SET NULL,
    pack_name TEXT NOT NULL,
    coins_purchased INTEGER NOT NULL CHECK (coins_purchased >= 0),
    bonus_coins INTEGER NOT NULL DEFAULT 0 CHECK (bonus_coins >= 0),
    price_paid NUMERIC NOT NULL CHECK (price_paid >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('razorpay', 'google_play', 'apple_pay', 'stripe')),
    payment_status TEXT NOT NULL DEFAULT 'completed' CHECK (payment_status IN ('completed', 'refunded', 'failed')),
    gateway_transaction_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_coin_packs_active ON public.coin_packs(is_active);
CREATE INDEX IF NOT EXISTS idx_coin_offers_pack_id ON public.coin_offers(pack_id);
CREATE INDEX IF NOT EXISTS idx_coin_purchases_user_id ON public.coin_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_purchases_created_at ON public.coin_purchases(created_at);

-- 6. Create Admin Views for Purchases and Shop Statistics
CREATE OR REPLACE VIEW public.admin_coin_purchases_view AS
SELECT 
    cp.id as purchase_id,
    cp.user_id,
    u.username,
    u.email,
    u.full_name,
    cp.pack_id,
    cp.pack_name,
    cp.coins_purchased,
    cp.bonus_coins,
    cp.price_paid,
    cp.payment_method,
    cp.payment_status,
    cp.gateway_transaction_id,
    cp.created_at
FROM public.coin_purchases cp
JOIN public.users u ON cp.user_id = u.id;

-- 7. Trigger to auto-update coin_packs.updated_at
CREATE TRIGGER update_coin_packs_updated_at
    BEFORE UPDATE ON public.coin_packs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coin_purchases_updated_at
    BEFORE UPDATE ON public.coin_purchases
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.coin_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_purchases ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies
-- Coin Packs: Anyone can view active packs, only admin can manage
CREATE POLICY "Anyone can view active coin packs"
    ON public.coin_packs FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage coin packs"
    ON public.coin_packs FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Coupons: Anyone can select to validate, only admin can manage
CREATE POLICY "Anyone can check coupons"
    ON public.coin_coupons FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage coupons"
    ON public.coin_coupons FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Offers: Anyone can select active offers, only admin can manage
CREATE POLICY "Anyone can view active coin offers"
    ON public.coin_offers FOR SELECT
    USING (is_active = true AND ends_at > now());

CREATE POLICY "Admins can manage coin offers"
    ON public.coin_offers FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Purchases: Users can view own purchases, only admin can manage
CREATE POLICY "Users can view own purchases"
    ON public.coin_purchases FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
    ON public.coin_purchases FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view and manage all purchases"
    ON public.coin_purchases FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- 10. Default Seed Data for Coin Packs
INSERT INTO public.coin_packs (name, coins, price, bonus_coins, tag, pack_type, is_active)
VALUES
  ('Starter Pack', 100, 0.99, 0, NULL, 'standard', true),
  ('Value Pack', 250, 1.99, 0, 'popular', 'standard', true),
  ('Bronze Chest', 500, 3.99, 10, NULL, 'standard', true),
  ('Silver Vault', 1000, 7.99, 100, NULL, 'standard', true),
  ('Gold Trove', 2500, 18.99, 500, 'best_value', 'standard', true),
  ('Platinum Crown', 5000, 34.99, 1500, NULL, 'standard', true),
  ('Legendary Hoard', 10000, 59.99, 5000, NULL, 'standard', true)
ON CONFLICT DO NOTHING;
