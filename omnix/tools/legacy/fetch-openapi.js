import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`;
  const res = await fetch(url);
  const text = await res.text();
  fs.writeFileSync('openapi.json', text);
}
run();
