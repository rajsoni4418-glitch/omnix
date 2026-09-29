import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL + '/rest/v1/?apikey=' + process.env.VITE_SUPABASE_ANON_KEY;

async function run() {
  const res = await fetch(url);
  const data = await res.json();
  const defs = data.definitions || data.paths;
  console.log(defs['users'] || defs['/users']?.get?.responses?.['200']?.schema?.items);
}
run();
