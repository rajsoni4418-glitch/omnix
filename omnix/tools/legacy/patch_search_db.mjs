import fs from 'fs';

let code = fs.readFileSync('src/pages/Search.tsx', 'utf8');

const targetQuery = `      if (activeTab === 'posts' || activeTab === 'videos' || activeTab === 'locations' || activeTab === 'hashtags') {
        let q = supabase
          .from('posts')
          .select(\`
            id,
            content:caption,
            caption,
            image_url,
            video_url,
            location,
            created_at,
            user_id,
            users:user_id (id, username, display_name:full_name, is_verified:verified),
            likes (id, user_id),
            comments (id)
          \`)
          .order('created_at', { ascending: false })
          .limit(20);`;

const replacementQuery = `      if (activeTab === 'posts' || activeTab === 'videos' || activeTab === 'locations' || activeTab === 'hashtags') {
        let q = supabase
          .from('posts')
          .select(\`
            id,
            content:caption,
            caption,
            image_url,
            video_url,
            location,
            created_at,
            user_id,
            likes (id, user_id),
            comments (id)
          \`)
          .order('created_at', { ascending: false })
          .limit(20);`;
          
code = code.replace(targetQuery, replacementQuery);

const targetFetch = `        const { data, error } = await q;

        if (error) throw error;

        const results = data?.map((post: any) => ({
          ...post,
          content: post.content || '',
          profile: Array.isArray(post.users) ? post.users[0] : post.users
        })) || [];

        return results;`;

const replacementFetch = `        const { data, error } = await q;

        if (error) throw error;
        
        let profilesData = [];
        if (data && data.length > 0) {
          const userIds = [...new Set(data.map(p => p.user_id).filter(Boolean))];
          if (userIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, username, display_name, is_verified, avatar_url')
              .in('id', userIds);
            if (profiles) profilesData = profiles;
          }
        }

        const results = data?.map((post: any) => ({
          ...post,
          content: post.content || '',
          users: profilesData.find(p => p.id === post.user_id) || null
        })) || [];

        return results;`;

code = code.replace(targetFetch, replacementFetch);
fs.writeFileSync('src/pages/Search.tsx', code);
