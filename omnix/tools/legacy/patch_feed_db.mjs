import fs from 'fs';

let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

const targetSelect = `.select(\`
        id,
        content:caption,
        caption,
        image_url,
        video_url,
        location,
        visibility,
        created_at,
        user_id,
        likes (id, user_id),
        comments (id)
      \`)`;

const replacementSelect = `.select(\`
        id,
        content:caption,
        caption,
        image_url,
        video_url,
        location,
        visibility,
        created_at,
        user_id,
        profiles!posts_user_id_fkey(id, username, display_name, is_verified, avatar_url),
        likes (id, user_id),
        comments (id)
      \`)`;
      
code = code.replace(targetSelect, replacementSelect);

const targetFetch = `// Manually fetch profiles
    let profilesData = [];
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(p => p.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, display_name, is_verified, avatar_url')
          .in('id', userIds);
        
        if (profilesError) {
          console.warn('[Feed/fetchPosts] Failed to fetch profiles:', profilesError);
        } else if (profiles) {
          profilesData = profiles;
        }
      }
    }

    const mappedData = data?.map((post: any) => {
      const profile = profilesData.find(p => p.id === post.user_id);
      return {
        ...post,
        content: post.caption || post.content || '',
        users: profile || null
      };
    }) || [];`;

const replacementFetch = `const mappedData = data?.map((post: any) => {
      const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
      return {
        ...post,
        content: post.caption || post.content || '',
        users: profile || null
      };
    }) || [];`;

code = code.replace(targetFetch, replacementFetch);

fs.writeFileSync('src/components/Feed.tsx', code);
