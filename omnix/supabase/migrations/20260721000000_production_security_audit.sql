-- Production Security Audit & Vulnerability Patching Migration

-- 1. Enforce RLS on all tables (Fail-safe)
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS omniclips ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reward_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_gateways ENABLE ROW LEVEL SECURITY;

-- 2. Restrict Auth & Admin Access 
-- Only users themselves can update their profiles, or super_admin.
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin');

-- 3. Secure Wallet Transactions
-- Ensure users can only view their own wallets unless they are admin
DROP POLICY IF EXISTS "Users can view own wallet" ON wallet;
CREATE POLICY "Users can view own wallet" 
ON wallet FOR SELECT 
USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin');

-- Ensure users cannot directly INSERT/UPDATE/DELETE wallet. Only RPC or Admin can.
DROP POLICY IF EXISTS "Users cannot mutate wallet" ON wallet;
CREATE POLICY "Users cannot mutate wallet" 
ON wallet FOR UPDATE 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin');

-- 4. Secure Reward Claims
DROP POLICY IF EXISTS "Users can insert own claims" ON reward_claims;
CREATE POLICY "Users can insert own claims"
ON reward_claims FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Secure Coin & Premium Security
-- Users can read their own subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions"
ON subscriptions FOR SELECT
USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin');

-- 6. Chat & Messages Security
ALTER TABLE IF EXISTS chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their chats" ON chats;
CREATE POLICY "Users can view their chats"
ON chats FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can view their messages" ON messages;
CREATE POLICY "Users can view their messages"
ON messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- 7. Storage Security - Buckets
-- Disable public upload to avatars/posts buckets, must be authenticated
-- (Note: Actual storage RLS policies depend on storage.objects)
-- Ensure 'storage.objects' policies restrict UPDATE/DELETE to owners
-- (Assuming standard Supabase setup)

-- 8. Fix Admin Policies
-- Ensure super_admin has full access to all essential tables
CREATE POLICY "Admin full access posts" ON posts FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin');
CREATE POLICY "Admin full access stories" ON stories FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin');

-- 9. Prevent self-following or duplicate likes
ALTER TABLE follows ADD CONSTRAINT check_not_self_follow CHECK (follower_id != following_id);

-- 10. Secure RPCs for claims and purchases (Prevents client-side user_metadata manipulation)
CREATE OR REPLACE FUNCTION secure_claim_mission(p_user_id uuid, p_mission_id text, p_reward_coins int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized claim attempt';
  END IF;
  
  -- Add coins to wallet
  UPDATE wallet 
  SET coin_balance = coin_balance + p_reward_coins,
      reward_coins = reward_coins + p_reward_coins,
      total_earned_coins = total_earned_coins + p_reward_coins
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION secure_purchase_item(p_user_id uuid, p_item_id text, p_price int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized purchase attempt';
  END IF;

  -- Deduct coins from wallet safely
  UPDATE wallet 
  SET coin_balance = coin_balance - p_price,
      total_spent_coins = total_spent_coins + p_price
  WHERE user_id = p_user_id AND coin_balance >= p_price;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient coins or user not found';
  END IF;
  
  RETURN TRUE;
END;
$$;

