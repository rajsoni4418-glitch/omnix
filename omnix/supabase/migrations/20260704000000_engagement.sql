-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  reply_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can see comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Likes Table
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can see likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can add likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Comment Likes
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can see comment likes" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can add comment likes" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove comment likes" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Shares
CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can see shares" ON shares FOR SELECT USING (true);
CREATE POLICY "Users can add shares" ON shares FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Saves
CREATE TABLE IF NOT EXISTS saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own saves" ON saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add saves" ON saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove saves" ON saves FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT DEFAULT 'Favorites',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, category)
);
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Reactions
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can see reactions" ON reactions FOR SELECT USING (true);
CREATE POLICY "Users can add reactions" ON reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove reactions" ON reactions FOR DELETE USING (auth.uid() = user_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notification_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own notifications" ON notification_events FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Users can update own notifications" ON notification_events FOR UPDATE USING (auth.uid() = recipient_id);
CREATE POLICY "Users can create notifications" ON notification_events FOR INSERT WITH CHECK (auth.uid() = actor_id);

