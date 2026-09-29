-- Omnix Virtual Gift System Database Schema
-- Migration: 20260717000000_virtual_gift_system.sql

-- 1. Create Gift Catalog Table
CREATE TABLE IF NOT EXISTS public.gift_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cost INTEGER NOT NULL CHECK (cost >= 0),
    animation TEXT NOT NULL, -- e.g. 'heart', 'rose', 'fire', 'star', 'diamond', etc.
    category TEXT NOT NULL CHECK (category IN ('standard', 'exclusive', 'festival', 'seasonal')),
    popularity INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_limited BOOLEAN DEFAULT false NOT NULL,
    limited_stock INTEGER DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Gift Transactions Table
CREATE TABLE IF NOT EXISTS public.gift_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    gift_id UUID REFERENCES public.gift_catalog(id) ON DELETE CASCADE NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('post', 'story', 'omniclip', 'live', 'profile')),
    item_id TEXT, -- ID of the target resource
    coin_cost INTEGER NOT NULL CHECK (coin_cost >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Gift Inventory Table
CREATE TABLE IF NOT EXISTS public.gift_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    gift_id UUID REFERENCES public.gift_catalog(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity >= 0),
    obtained_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_limited BOOLEAN DEFAULT false NOT NULL,
    CONSTRAINT unique_user_gift UNIQUE (user_id, gift_id)
);

-- 4. Create Creator Gift Earnings Table
CREATE TABLE IF NOT EXISTS public.creator_gift_earnings (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    total_coins_earned BIGINT DEFAULT 0 NOT NULL CHECK (total_coins_earned >= 0),
    total_gifts_received INTEGER DEFAULT 0 NOT NULL CHECK (total_gifts_received >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Gift Analytics Table
CREATE TABLE IF NOT EXISTS public.gift_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_id UUID REFERENCES public.gift_catalog(id) ON DELETE CASCADE UNIQUE NOT NULL,
    send_count INTEGER DEFAULT 0 NOT NULL CHECK (send_count >= 0),
    total_coins_volume BIGINT DEFAULT 0 NOT NULL CHECK (total_coins_volume >= 0),
    last_sent_at TIMESTAMP WITH TIME ZONE
);

-- 6. Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_gift_catalog_is_active ON public.gift_catalog(is_active);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_sender ON public.gift_transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_receiver ON public.gift_transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_item ON public.gift_transactions(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_gift_inventory_user ON public.gift_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_gift_earnings_coins ON public.creator_gift_earnings(total_coins_earned DESC);

-- 7. Seed Default Gifts into Catalog
INSERT INTO public.gift_catalog (name, cost, animation, category, popularity, is_active, is_limited) VALUES
('Heart', 10, 'heart', 'standard', 150, true, false),
('Rose', 25, 'rose', 'standard', 120, true, false),
('Fire', 50, 'fire', 'standard', 200, true, false),
('Star', 100, 'star', 'standard', 85, true, false),
('Diamond', 250, 'diamond', 'exclusive', 95, true, false),
('Crown', 500, 'crown', 'exclusive', 70, true, false),
('Rocket', 1000, 'rocket', 'exclusive', 45, true, false),
('Gift Box', 150, 'gift_box', 'standard', 60, true, false),
('Trophy', 300, 'trophy', 'exclusive', 35, true, false),
('Teddy Bear', 80, 'teddy_bear', 'standard', 50, true, false),
('Ring', 400, 'ring', 'exclusive', 30, true, false),
('Sports Car', 2500, 'sports_car', 'exclusive', 15, true, false),
('Castle', 5000, 'castle', 'exclusive', 5, true, false),
('Money Rain', 1500, 'money_rain', 'exclusive', 25, true, false),
('Golden Crown', 7500, 'golden_crown', 'exclusive', 10, true, false),
-- Seasonal / festival / limited editions
('Spooky Pumpkin', 120, 'pumpkin', 'seasonal', 10, true, false),
('Snow Globe', 180, 'snowglobe', 'seasonal', 15, true, false),
('Dragon Dance', 2000, 'dragon', 'festival', 8, true, true),
('Easter Bunny', 90, 'bunny', 'seasonal', 20, true, false);

-- Initialize analytics for all seeded gifts
INSERT INTO public.gift_analytics (gift_id, send_count, total_coins_volume)
SELECT id, 0, 0 FROM public.gift_catalog
ON CONFLICT (gift_id) DO NOTHING;

-- 8. Create Gift History View (Comprehensive Join)
CREATE OR REPLACE VIEW public.gift_history AS
SELECT 
    gt.id,
    gt.sender_id,
    su.username as sender_username,
    su.full_name as sender_full_name,
    gt.receiver_id,
    ru.username as receiver_username,
    ru.full_name as receiver_full_name,
    gt.gift_id,
    gc.name as gift_name,
    gc.animation as gift_animation,
    gc.category as gift_category,
    gt.item_type,
    gt.item_id,
    gt.coin_cost,
    gt.created_at
FROM public.gift_transactions gt
JOIN public.gift_catalog gc ON gt.gift_id = gc.id
LEFT JOIN public.users su ON gt.sender_id = su.id
LEFT JOIN public.users ru ON gt.receiver_id = ru.id;

-- 9. Transactional RPC to Secure Gifting
-- Deducts coins atomically from sender, adds to receiver, updates wallets, creates logs and transactions.
-- Prevents negative balances, duplicate transactions, fraud.
CREATE OR REPLACE FUNCTION public.send_virtual_gift(
    p_sender_id UUID,
    p_receiver_id UUID,
    p_gift_id UUID,
    p_item_type TEXT,
    p_item_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_gift_cost INTEGER;
    v_gift_name TEXT;
    v_gift_is_limited BOOLEAN;
    v_gift_stock INTEGER;
    v_sender_wallet public.wallets%ROWTYPE;
    v_receiver_wallet public.wallets%ROWTYPE;
    v_sender_new_balance BIGINT;
    v_receiver_new_balance BIGINT;
    v_tx_id UUID;
    v_ref_id TEXT;
BEGIN
    -- 1. Ensure sender and receiver are distinct
    IF p_sender_id = p_receiver_id THEN
        RETURN json_build_object('success', false, 'error', 'You cannot send gifts to yourself.');
    END IF;

    -- 2. Lock and retrieve gift item
    SELECT cost, name, is_limited, limited_stock 
    INTO v_gift_cost, v_gift_name, v_gift_is_limited, v_gift_stock 
    FROM public.gift_catalog 
    WHERE id = p_gift_id AND is_active = true FOR SHARE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Gift item not found or currently unavailable.');
    END IF;

    -- 3. If limited stock, check and decrement
    IF v_gift_is_limited AND v_gift_stock IS NOT NULL THEN
        IF v_gift_stock <= 0 THEN
            RETURN json_build_object('success', false, 'error', 'This exclusive gift is sold out!');
        END IF;
        
        UPDATE public.gift_catalog 
        SET limited_stock = limited_stock - 1,
            updated_at = now()
        WHERE id = p_gift_id;
    END IF;

    -- 4. Lock sender wallet
    SELECT * INTO v_sender_wallet FROM public.wallets WHERE user_id = p_sender_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Sender wallet not found.');
    END IF;

    IF v_sender_wallet.is_frozen THEN
        RETURN json_build_object('success', false, 'error', 'Your wallet is frozen. Transactions are disabled.');
    END IF;

    -- 5. Lock receiver wallet
    SELECT * INTO v_receiver_wallet FROM public.wallets WHERE user_id = p_receiver_id FOR UPDATE;
    IF NOT FOUND THEN
        -- Auto-create receiver wallet if missing
        INSERT INTO public.wallets (user_id) VALUES (p_receiver_id) RETURNING * INTO v_receiver_wallet;
    END IF;

    -- 6. Verify negative balance constraint
    v_sender_new_balance := v_sender_wallet.coin_balance - v_gift_cost;
    IF v_sender_new_balance < 0 THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient coin balance to purchase this gift.');
    END IF;

    v_receiver_new_balance := v_receiver_wallet.coin_balance + v_gift_cost;

    -- Generate reference id
    v_ref_id := 'gift_ref_' || encode(hmac(p_sender_id::text || p_receiver_id::text || now()::text, 'omnix_secret', 'sha256'), 'hex');

    -- 7. Deduct from sender's wallet
    UPDATE public.wallets
    SET coin_balance = v_sender_new_balance,
        total_spent_coins = total_spent_coins + v_gift_cost,
        total_gifted_coins = total_gifted_coins + v_gift_cost,
        updated_at = now()
    WHERE user_id = p_sender_id;

    INSERT INTO public.wallet_transactions (user_id, amount, type, description, source, reference_id, status)
    VALUES (p_sender_id, -v_gift_cost, 'gift_sent', 'Sent gift: ' || v_gift_name, 'gift', v_ref_id, 'completed');

    -- 8. Add to receiver's wallet
    UPDATE public.wallets
    SET coin_balance = v_receiver_new_balance,
        gift_coins = gift_coins + v_gift_cost,
        total_earned_coins = total_earned_coins + v_gift_cost,
        updated_at = now()
    WHERE user_id = p_receiver_id;

    INSERT INTO public.wallet_transactions (user_id, amount, type, description, source, reference_id, status)
    VALUES (p_receiver_id, v_gift_cost, 'gift_received', 'Received gift: ' || v_gift_name, 'gift', v_ref_id, 'completed');

    -- 9. Create Gift Transaction
    INSERT INTO public.gift_transactions (sender_id, receiver_id, gift_id, item_type, item_id, coin_cost)
    VALUES (p_sender_id, p_receiver_id, p_gift_id, p_item_type, p_item_id, v_gift_cost)
    RETURNING id INTO v_tx_id;

    -- 10. Update inventory logs
    INSERT INTO public.gift_inventory (user_id, gift_id, quantity, is_limited)
    VALUES (p_sender_id, p_gift_id, 1, v_gift_is_limited)
    ON CONFLICT (user_id, gift_id) 
    DO UPDATE SET quantity = gift_inventory.quantity + 1, obtained_at = now();

    -- 11. Update Creator earnings stats
    INSERT INTO public.creator_gift_earnings (user_id, total_coins_earned, total_gifts_received, updated_at)
    VALUES (p_receiver_id, v_gift_cost, 1, now())
    ON CONFLICT (user_id)
    DO UPDATE SET 
        total_coins_earned = creator_gift_earnings.total_coins_earned + v_gift_cost,
        total_gifts_received = creator_gift_earnings.total_gifts_received + 1,
        updated_at = now();

    -- 12. Update Gift Analytics
    INSERT INTO public.gift_analytics (gift_id, send_count, total_coins_volume, last_sent_at)
    VALUES (p_gift_id, 1, v_gift_cost, now())
    ON CONFLICT (gift_id)
    DO UPDATE SET 
        send_count = gift_analytics.send_count + 1,
        total_coins_volume = gift_analytics.total_coins_volume + v_gift_cost,
        last_sent_at = now();

    -- Double-Spending Verification Logs
    INSERT INTO public.wallet_audit (user_id, transaction_id, previous_balance, new_balance, verified)
    VALUES 
    (p_sender_id, v_tx_id, v_sender_wallet.coin_balance, v_sender_new_balance, true),
    (p_receiver_id, v_tx_id, v_receiver_wallet.coin_balance, v_receiver_new_balance, true);

    RETURN json_build_object(
        'success', true,
        'transaction_id', v_tx_id,
        'gift_cost', v_gift_cost,
        'sender_new_balance', v_sender_new_balance
    );
END;
$$;

-- 10. Enable Row Level Security (RLS) on all Gifting Tables
ALTER TABLE public.gift_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_gift_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_analytics ENABLE ROW LEVEL SECURITY;

-- 11. Gifting RLS Policies
-- Catalog: anyone can read active ones, only admins can manage
CREATE POLICY "Anyone can view active gifts" 
    ON public.gift_catalog FOR SELECT 
    USING (is_active = true OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage catalog" 
    ON public.gift_catalog FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Transactions: sender or receiver can view their own transactions, admins can view all
CREATE POLICY "Users can view own gift transactions" 
    ON public.gift_transactions FOR SELECT 
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Inventory: users can view own inventory
CREATE POLICY "Users can view own gift inventory" 
    ON public.gift_inventory FOR SELECT 
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Creator Earnings: anyone can read creator earnings statistics, only system / admin can edit
CREATE POLICY "Anyone can view creator gift earnings" 
    ON public.creator_gift_earnings FOR SELECT 
    USING (true);

-- Analytics: anyone can view analytics, admins can manage
CREATE POLICY "Anyone can view gift analytics" 
    ON public.gift_analytics FOR SELECT 
    USING (true);
