import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`;
  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json();
    console.log(JSON.stringify(data.definitions, null, 2));
  } else {
    console.log("Error:", response.status, await response.text());
  }
}
run();
