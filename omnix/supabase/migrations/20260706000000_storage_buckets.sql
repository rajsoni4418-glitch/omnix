-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('ai-studio', 'ai-studio', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'media' bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Auth Users can upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own media" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND auth.uid() = owner);
CREATE POLICY "Users can delete own media" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND auth.uid() = owner);

-- Storage Policies for 'ai-studio' bucket
CREATE POLICY "Public Access AI Studio" ON storage.objects FOR SELECT USING (bucket_id = 'ai-studio');
CREATE POLICY "Auth Users can upload AI Studio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ai-studio' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own AI Studio" ON storage.objects FOR UPDATE USING (bucket_id = 'ai-studio' AND auth.uid() = owner);
CREATE POLICY "Users can delete own AI Studio" ON storage.objects FOR DELETE USING (bucket_id = 'ai-studio' AND auth.uid() = owner);
