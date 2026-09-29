import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.storage.createBucket('stories', { public: true });
  console.log("Create stories:", data, error);
  const { data: d2, error: e2 } = await supabase.storage.createBucket('media', { public: true });
  console.log("Create media:", d2, e2);
  const { data: d3, error: e3 } = await supabase.storage.createBucket('posts', { public: true });
  console.log("Create posts:", d3, e3);
}
check();
