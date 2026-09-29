-- Upgrading stories table
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image',
ADD COLUMN IF NOT EXISTS caption TEXT,
ADD COLUMN IF NOT EXISTS privacy TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS music TEXT,
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reaction_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;

-- Stories reactions table
CREATE TABLE IF NOT EXISTS story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can see story reactions" ON story_reactions FOR SELECT USING (true);
CREATE POLICY "Users can add their own story reactions" ON story_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own story reactions" ON story_reactions FOR DELETE USING (auth.uid() = user_id);

-- Story viewers table
CREATE TABLE IF NOT EXISTS story_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

ALTER TABLE story_viewers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can see story viewers" ON story_viewers FOR SELECT USING (true);
CREATE POLICY "Users can add themselves as viewers" ON story_viewers FOR INSERT WITH CHECK (auth.uid() = user_id);
