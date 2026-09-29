import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const cols = [
  'id',
  'text',
  'body',
  'description',
  'caption',
  'title',
  'message',
  'images',
  'media',
  'attachments',
  'video_url',
  'image_url',
  'user_id',
  'created_at'
];

async function run() {
  for (const c of cols) {
    const { error } = await supabase.from('posts').select(c).limit(1);
    if (!error) console.log(c);
  }
}

run();
