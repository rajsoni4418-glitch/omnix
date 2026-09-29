import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response (first 500 chars):', text.substring(0, 500));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
run();
