import * as dotenv from 'dotenv';
dotenv.config();

async function check() {
  const url = process.env.VITE_SUPABASE_URL + '/rest/v1/?apikey=' + process.env.VITE_SUPABASE_ANON_KEY;
  const res = await fetch(url);
  const data = await res.json();
  console.log(data);
}
check();
