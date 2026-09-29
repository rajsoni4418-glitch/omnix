import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const cols = [
  'username',
  'user_name',
  'avatar_url',
  'avatar_uri',
  'image',
  'img',
  'photo',
  'profile_pic',
  'profile_url',
  'pic',
  'icon',
  'logo',
  'background',
  'url'
];

async function run() {
  for (const c of cols) {
    const { error } = await supabase.from('users').select(c).limit(1);
    if (!error) console.log(c);
  }
}

run();
