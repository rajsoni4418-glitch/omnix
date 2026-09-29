-- Omnix Wallet System Database Schema
-- Migration: 20260715000000_wallet_system.sql

-- 1. Create Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    coin_balance BIGINT NOT NULL DEFAULT 0,
    reward_coins BIGINT NOT NULL DEFAULT 0,
    gift_coins BIGINT NOT NULL DEFAULT 0,
    pending_coins BIGINT NOT NULL DEFAULT 0,
    total_earned_coins BIGINT NOT NULL DEFAULT 0,
    total_spent_coins BIGINT NOT NULL DEFAULT 0,
    total_gifted_coins BIGINT NOT NULL DEFAULT 0,
    is_frozen BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT positive_balance CHECK (coin_balance >= 0)
);

-- 2. Drop existing wallet_transactions if they conflict with our structure or recreate cleanly
-- Since wallet_transactions might already exist, we make sure it has our schema
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount BIGINT NOT NULL, -- positive for credits, negative for debits
    type TEXT NOT NULL, -- 'daily_reward', 'mission_reward', 'story_reward', 'post_reward', 'omniclip_reward', 'referral_reward', 'creator_reward', 'coin_purchase', 'gift_sent', 'gift_received', 'refund', 'admin_reward', 'manual_adjustment'
    status TEXT NOT NULL DEFAULT 'completed', -- 'completed', 'pending', 'failed', 'refunded'
    description TEXT NOT NULL,
    source TEXT NOT NULL, -- 'system', 'purchase_gateway', 'in_app', 'gift', etc.
    reference_id TEXT, -- unique reference to prevent duplicate rewards/transactions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Wallet Logs Table for audit trails of admin/system modifications
CREATE TABLE IF NOT EXISTS public.wallet_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL, -- 'wallet_created', 'wallet_frozen', 'wallet_unfrozen', 'admin_adjustment', 'security_violation'
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Wallet Audit Table for double-spending checks
CREATE TABLE IF NOT EXISTS public.wallet_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    transaction_id UUID,
    previous_balance BIGINT NOT NULL,
    new_balance BIGINT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Indexes for fast transaction search and wallet queries
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_ref_id ON public.wallet_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_wallet_logs_user_id ON public.wallet_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_audit_user_id ON public.wallet_audit(user_id);

-- 6. Trigger to automatically create a wallet for every new user
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (
        user_id, 
        coin_balance, 
        reward_coins, 
        gift_coins, 
        pending_coins, 
        total_earned_coins, 
        total_spent_coins, 
        total_gifted_coins, 
        is_frozen
    )
    VALUES (NEW.id, 100, 50, 0, 0, 100, 0, 0, false) -- Seed new users with 100 welcome coins
    ON CONFLICT (user_id) DO NOTHING;
    
    INSERT INTO public.wallet_logs (user_id, action, details)
    VALUES (NEW.id, 'wallet_created', 'Wallet auto-created on user registration with 100 welcome coins.');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_wallet ON public.users;
CREATE TRIGGER on_user_created_wallet
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- 7. View to display comprehensive wallet and user metadata for admin panel
CREATE OR REPLACE VIEW public.admin_wallet_overview_view AS
SELECT 
    w.user_id,
    u.username,
    u.email,
    u.full_name,
    w.coin_balance,
    w.reward_coins,
    w.gift_coins,
    w.pending_coins,
    w.total_earned_coins,
    w.total_spent_coins,
    w.total_gifted_coins,
    w.is_frozen,
    w.created_at,
    w.updated_at
FROM public.wallets w
JOIN public.users u ON w.user_id = u.id;

-- 8. Core Secure Database RPC Function for Transactions
-- Handles concurrency, double-spending prevention, freezing checks, and strict business rules
CREATE OR REPLACE FUNCTION public.execute_wallet_transaction(
    p_user_id UUID,
    p_amount BIGINT,
    p_type TEXT,
    p_description TEXT,
    p_source TEXT,
    p_reference_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet public.wallets%ROWTYPE;
    v_prev_balance BIGINT;
    v_new_balance BIGINT;
    v_tx_id UUID;
    v_duplicate_exists BOOLEAN;
BEGIN
    -- Prevent duplicate transaction checks using reference_id
    IF p_reference_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM public.wallet_transactions 
            WHERE user_id = p_user_id 
              AND reference_id = p_reference_id 
              AND type = p_type
        ) INTO v_duplicate_exists;
        
        IF v_duplicate_exists THEN
            RETURN json_build_object('success', false, 'error', 'Duplicate transaction detected');
        END IF;
    END IF;

    -- Lock the wallet row to prevent race conditions / double spending
    SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
    
    -- If wallet doesn't exist, create it first
    IF NOT FOUND THEN
        INSERT INTO public.wallets (user_id) VALUES (p_user_id) 
        RETURNING * INTO v_wallet;
    END IF;

    -- Check if wallet is frozen
    IF v_wallet.is_frozen THEN
        RETURN json_build_object('success', false, 'error', 'Wallet is frozen. Transactions are disabled.');
    END IF;

    -- Calculate balances and verify negative balance checks
    v_prev_balance := v_wallet.coin_balance;
    v_new_balance := v_prev_balance + p_amount;

    IF v_new_balance < 0 THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient balance');
    END IF;

    -- Create transaction entry
    INSERT INTO public.wallet_transactions (
        user_id, 
        amount, 
        type, 
        description, 
        source, 
        reference_id, 
        status
    )
    VALUES (
        p_user_id, 
        p_amount, 
        p_type, 
        p_description, 
        p_source, 
        p_reference_id, 
        'completed'
    )
    RETURNING id INTO v_tx_id;

    -- Update wallet coins and totals
    IF p_amount > 0 THEN
        UPDATE public.wallets
        SET coin_balance = v_new_balance,
            reward_coins = CASE WHEN p_type LIKE '%reward%' THEN reward_coins + p_amount ELSE reward_coins END,
            total_earned_coins = total_earned_coins + p_amount,
            updated_at = now()
        WHERE user_id = p_user_id;
    ELSE
        UPDATE public.wallets
        SET coin_balance = v_new_balance,
            total_spent_coins = total_spent_coins + ABS(p_amount),
            updated_at = now()
        WHERE user_id = p_user_id;
    END IF;

    -- Record audit log
    INSERT INTO public.wallet_audit (
        user_id, 
        transaction_id, 
        previous_balance, 
        new_balance, 
        verified
    )
    VALUES (
        p_user_id, 
        v_tx_id, 
        v_prev_balance, 
        v_new_balance, 
        true
    );

    RETURN json_build_object(
        'success', true, 
        'transaction_id', v_tx_id, 
        'new_balance', v_new_balance
    );
END;
$$;

-- 9. RPC Functions for Admins (Freeze, Unfreeze, Adjustments)
CREATE OR REPLACE FUNCTION public.admin_set_wallet_frozen(
    target_user_id UUID,
    p_frozen BOOLEAN,
    p_details TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Verify if executor is indeed admin
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: Administrator privileges required';
    END IF;

    UPDATE public.wallets
    SET is_frozen = p_frozen,
        updated_at = now()
    WHERE user_id = target_user_id;

    INSERT INTO public.wallet_logs (user_id, action, details)
    VALUES (
        target_user_id, 
        CASE WHEN p_frozen THEN 'wallet_frozen' ELSE 'wallet_unfrozen' END, 
        COALESCE(p_details, 'Wallet status manually changed by Administrator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_audit ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies
-- Wallets: Users can view own wallet, only admins can modify directly
CREATE POLICY "Users can view own wallet" 
    ON public.wallets FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all wallets" 
    ON public.wallets FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Transactions: Users can view own transactions
CREATE POLICY "Users can view own transactions" 
    ON public.wallet_transactions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" 
    ON public.wallet_transactions FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Logs: Only admins can view logs
CREATE POLICY "Admins can view all wallet logs" 
    ON public.wallet_logs FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Audit: Only admins can view audits
CREATE POLICY "Admins can view all wallet audits" 
    ON public.wallet_audit FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
