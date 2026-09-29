import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const tables = Object.keys(data.paths).map(p => p.split('/')[1]).filter((v, i, a) => a.indexOf(v) === i);
  console.log('Tables from paths:', tables);
}
run();
