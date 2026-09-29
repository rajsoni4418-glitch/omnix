import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const email = `testuser_${Date.now()}@example.com`;
  const { data: { user }, error: signupError } = await supabase.auth.signUp({
    email, password: 'password123'
  });
  if (signupError) { console.log("Signup failed", signupError); return; }
  
  const uid = user.id;
  console.log("Got user:", uid);
  
  // Test users table
  let usersPayload = { id: uid };
  for (let i = 0; i < 10; i++) {
    const { error } = await supabase.from('users').insert(usersPayload);
    if (!error) { console.log("Users payload SUCCESS:", Object.keys(usersPayload)); break; }
    if (error.code === '23502') { // NOT NULL violation
      const colMatch = error.message.match(/column "(.*?)"/);
      if (colMatch) {
        console.log("Users missing:", colMatch[1]);
        usersPayload[colMatch[1]] = 'test';
      } else {
        console.log("Users error:", error); break;
      }
    } else {
      console.log("Users other error:", error); break;
    }
  }

  // Test posts table
  let postsPayload = { user_id: uid };
  for (let i = 0; i < 10; i++) {
    const { error } = await supabase.from('posts').insert(postsPayload);
    if (!error) { console.log("Posts payload SUCCESS:", Object.keys(postsPayload)); break; }
    if (error.code === '23502') {
      const colMatch = error.message.match(/column "(.*?)"/);
      if (colMatch) {
        console.log("Posts missing:", colMatch[1]);
        postsPayload[colMatch[1]] = 'test';
      } else {
        console.log("Posts error:", error); break;
      }
    } else {
      console.log("Posts other error:", error); break;
    }
  }

  // stories
  let storiesPayload = { user_id: uid };
  for (let i = 0; i < 10; i++) {
    const { error } = await supabase.from('stories').insert(storiesPayload);
    if (!error) { console.log("Stories payload SUCCESS:", Object.keys(storiesPayload)); break; }
    if (error.code === '23502') {
      const colMatch = error.message.match(/column "(.*?)"/);
      if (colMatch) {
        console.log("Stories missing:", colMatch[1]);
        storiesPayload[colMatch[1]] = 'http://test.com'; // In case it's a URL
      }
    } else { console.log("Stories error:", error); break; }
  }

  // omniclips
  let clipsPayload = { user_id: uid };
  for (let i = 0; i < 10; i++) {
    const { error } = await supabase.from('omniclips').insert(clipsPayload);
    if (!error) { console.log("Omniclips SUCCESS:", Object.keys(clipsPayload)); break; }
    if (error.code === '23502') {
      const colMatch = error.message.match(/column "(.*?)"/);
      if (colMatch) clipsPayload[colMatch[1]] = 'http://test.com';
    } else { console.log("Omniclips error:", error); break; }
  }

  // communities
  let commPayload = { creator_id: uid }; // or owner_id
  for (let i = 0; i < 10; i++) {
    const { error } = await supabase.from('communities').insert(commPayload);
    if (!error) { console.log("Communities SUCCESS:", Object.keys(commPayload)); break; }
    if (error.code === '23502') {
      const colMatch = error.message.match(/column "(.*?)"/);
      if (colMatch) commPayload[colMatch[1]] = 'test';
    } else { console.log("Communities error:", error); break; }
  }
}
run();
