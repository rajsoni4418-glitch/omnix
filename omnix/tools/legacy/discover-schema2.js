import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: { user }, error: signinError } = await supabase.auth.signInWithPassword({
    email: 'emma_w@example.com', password: 'password123'
  });
  if (signinError) { console.log("Signin failed", signinError); return; }
  
  const uid = user.id;
  console.log("Got user:", uid);
  
  // Test users table
  let usersPayload = { id: uid };
  for (let i = 0; i < 20; i++) {
    const { error } = await supabase.from('users').update(usersPayload).eq('id', uid);
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

  // To find required columns, we MUST use INSERT, but we can't insert a duplicate ID for users.
  // We can insert into posts
  let postsPayload = { user_id: uid };
  for (let i = 0; i < 20; i++) {
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
  for (let i = 0; i < 20; i++) {
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
  for (let i = 0; i < 20; i++) {
    const { error } = await supabase.from('omniclips').insert(clipsPayload);
    if (!error) { console.log("Omniclips SUCCESS:", Object.keys(clipsPayload)); break; }
    if (error.code === '23502') {
      const colMatch = error.message.match(/column "(.*?)"/);
      if (colMatch) clipsPayload[colMatch[1]] = 'http://test.com';
    } else { console.log("Omniclips error:", error); break; }
  }

  // communities
  let commPayload = { creator_id: uid }; // or owner_id
  for (let i = 0; i < 20; i++) {
    const { error } = await supabase.from('communities').insert(commPayload);
    if (!error) { console.log("Communities SUCCESS:", Object.keys(commPayload)); break; }
    if (error.code === '23502') {
      const colMatch = error.message.match(/column "(.*?)"/);
      if (colMatch) commPayload[colMatch[1]] = 'test';
    } else { console.log("Communities error:", error); break; }
  }

  // comments
  let commentPayload = { user_id: uid }; 
  for (let i = 0; i < 20; i++) {
    const { error } = await supabase.from('comments').insert(commentPayload);
    if (!error) { console.log("Comments SUCCESS:", Object.keys(commentPayload)); break; }
    if (error.code === '23502') {
      const colMatch = error.message.match(/column "(.*?)"/);
      if (colMatch) commentPayload[colMatch[1]] = 'test';
    } else { console.log("Comments error:", error); break; }
  }

  // notifications
  let notifPayload = { user_id: uid }; 
  for (let i = 0; i < 20; i++) {
    const { error } = await supabase.from('notifications').insert(notifPayload);
    if (!error) { console.log("Notifications SUCCESS:", Object.keys(notifPayload)); break; }
    if (error.code === '23502') {
      const colMatch = error.message.match(/column "(.*?)"/);
      if (colMatch) notifPayload[colMatch[1]] = 'test';
    } else { console.log("Notifications error:", error); break; }
  }

  // followers
  let followPayload = { follower_id: uid, following_id: uid }; 
  for (let i = 0; i < 20; i++) {
    const { error } = await supabase.from('followers').insert(followPayload);
    if (!error) { console.log("Followers SUCCESS:", Object.keys(followPayload)); break; }
    if (error.code === '23502') {
      const colMatch = error.message.match(/column "(.*?)"/);
      if (colMatch) followPayload[colMatch[1]] = 'test';
    } else { console.log("Followers error:", error); break; }
  }
}
run();
