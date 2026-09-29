ALTER TABLE posts
ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS hashtags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS mentions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- Create collections table for saved posts
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own collections" ON collections
  FOR ALL USING (auth.uid() = user_id);

-- Post collections link
CREATE TABLE IF NOT EXISTS post_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, post_id)
);

ALTER TABLE post_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage items in their collections" ON post_collections
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM collections WHERE id = collection_id));
