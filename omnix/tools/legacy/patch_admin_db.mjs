import fs from 'fs';

let code = fs.readFileSync('src/pages/admin/AdminModeration.tsx', 'utf8');

const targetFetch = `      if (filter === 'posts') {
        const { data } = await supabase.from('posts').select('*, user:profiles!user_id(username)').order('created_at', { ascending: false }).limit(50);
        if (data) setPosts(data);
      } else if (filter === 'stories') {
        const { data } = await supabase.from('stories').select('*, user:users!stories_user_id_fkey(username)').order('created_at', { ascending: false }).limit(50);
        if (data) setPosts(data);
      } else {
        setPosts([]);
      }`;

const replacementFetch = `      if (filter === 'posts' || filter === 'stories') {
        const { data } = await supabase.from(filter).select('*').order('created_at', { ascending: false }).limit(50);
        if (data && data.length > 0) {
          const userIds = [...new Set(data.map(p => p.user_id).filter(Boolean))];
          if (userIds.length > 0) {
             const { data: profiles } = await supabase.from('profiles').select('id, username').in('id', userIds);
             const mappedData = data.map(item => ({
               ...item,
               user: profiles?.find(p => p.id === item.user_id) || null
             }));
             setPosts(mappedData);
             return;
          }
        }
        if (data) setPosts(data);
      } else {
        setPosts([]);
      }`;

code = code.replace(targetFetch, replacementFetch);
fs.writeFileSync('src/pages/admin/AdminModeration.tsx', code);
