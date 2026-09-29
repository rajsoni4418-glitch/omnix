CREATE TABLE IF NOT EXISTS ai_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own chat messages" ON ai_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own chat messages" ON ai_chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat messages" ON ai_chats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages" ON ai_chats
  FOR DELETE USING (auth.uid() = user_id);
