import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/wallet_transactions`;
  const res = await fetch(url, {
    method: 'OPTIONS',
    headers: {
      'apikey': process.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
    }
  });
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response body:', text);
}
run();
