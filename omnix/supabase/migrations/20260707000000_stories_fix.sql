-- Create bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('stories', 'stories', true) ON CONFLICT (id) DO NOTHING;

-- Policies for stories bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'stories');
CREATE POLICY "Auth Users can upload stories" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'stories' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own stories" ON storage.objects FOR UPDATE USING (bucket_id = 'stories' AND auth.uid() = owner);
CREATE POLICY "Users can delete own stories" ON storage.objects FOR DELETE USING (bucket_id = 'stories' AND auth.uid() = owner);

-- Add missing columns to stories
ALTER TABLE stories 
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS caption TEXT,
  ADD COLUMN IF NOT EXISTS privacy TEXT DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS music TEXT,
  ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reaction_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;

