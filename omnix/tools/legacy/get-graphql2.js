import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = `${process.env.VITE_SUPABASE_URL}/graphql/v1`;
  const query = `
    query {
      __schema {
        types {
          name
        }
      }
    }
  `;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': process.env.VITE_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  console.log(data);
}
run();
