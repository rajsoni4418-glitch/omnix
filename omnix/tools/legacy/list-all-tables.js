import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const tables = Object.keys(data.definitions);
  console.log('Tables:', tables);
}
run();
