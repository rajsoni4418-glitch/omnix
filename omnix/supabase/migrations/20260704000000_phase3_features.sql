-- Wallet & Coins
CREATE TABLE IF NOT EXISTS wallet_balances (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  coins INTEGER DEFAULT 0,
  fiat_balance DECIMAL(10,2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'credit', 'debit'
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD', -- or 'COINS'
  title TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS creator_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tier TEXT DEFAULT 'premium',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(creator_id, subscriber_id)
);

-- Live Streams
CREATE TABLE IF NOT EXISTS live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'live',
  viewer_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Reports
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL, -- 'user', 'post', 'comment', 'message'
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gifts
CREATE TABLE IF NOT EXISTS sent_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  gift_name TEXT NOT NULL,
  coin_cost INTEGER NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  live_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Accounts
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_business BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS business_email TEXT,
ADD COLUMN IF NOT EXISTS business_phone TEXT,
ADD COLUMN IF NOT EXISTS business_website TEXT,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- RLS
ALTER TABLE wallet_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wallet" ON wallet_balances FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE creator_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view subscriptions" ON creator_subscriptions FOR SELECT USING (true);
CREATE POLICY "Users can subscribe" ON creator_subscriptions FOR INSERT WITH CHECK (auth.uid() = subscriber_id);

ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view live streams" ON live_streams FOR SELECT USING (true);
CREATE POLICY "Hosts can manage streams" ON live_streams FOR ALL USING (auth.uid() = host_id);

ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view reports" ON user_reports FOR SELECT USING (true); -- should be admin only ideally
CREATE POLICY "Users can create reports" ON user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

ALTER TABLE sent_gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view gifts" ON sent_gifts FOR SELECT USING (true);
CREATE POLICY "Users can send gifts" ON sent_gifts FOR INSERT WITH CHECK (auth.uid() = sender_id);
