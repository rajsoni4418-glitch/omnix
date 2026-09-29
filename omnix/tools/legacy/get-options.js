import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/rewards`;
  const res = await fetch(url, {
    method: 'OPTIONS',
    headers: {
      'apikey': process.env.VITE_SUPABASE_ANON_KEY
    }
  });
  console.log(res.headers.get('allow'));
}
run();
