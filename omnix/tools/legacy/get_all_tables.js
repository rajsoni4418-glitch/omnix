import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/`;
  const res = await fetch(url, {
    headers: {
      'apikey': process.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
    }
  });
  const data = await res.json();
  console.log('Top level keys:', Object.keys(data));
  if (data.paths) {
    console.log('Paths:', Object.keys(data.paths).slice(0, 10));
  }
  if (data.definitions) {
    console.log('Definitions:', Object.keys(data.definitions).slice(0, 10));
  }
}
run();
