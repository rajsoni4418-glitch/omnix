async function run() {
  const url = process.env.VITE_SUPABASE_URL + '/graphql/v1';
  const query = `
    query {
      __type(name: "users") {
        fields {
          name
        }
      }
    }
  `;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.VITE_SUPABASE_ANON_KEY
    },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
