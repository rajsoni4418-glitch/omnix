import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('OpenAPI response root keys:', Object.keys(data));
  if (data.definitions) {
    console.log('definitions keys:', Object.keys(data.definitions));
  } else if (data.components && data.components.schemas) {
    console.log('components.schemas keys:', Object.keys(data.components.schemas));
  }
}
run();
