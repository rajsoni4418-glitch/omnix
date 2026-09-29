import fs from 'fs';

let code = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

const targetFetch = `  const fetchExploreContent = async ({ pageParam = 0 }) => {
    // We'll fetch a mix of videos and images
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles!posts_user_id_fkey(username, avatar_url, full_name, is_verified)')
      .order('created_at', { ascending: false })
      .range(pageParam * 20, (pageParam + 1) * 20 - 1);
    if (error) throw error;
    return data || [];
  };`;

const replacementFetch = `  const fetchExploreContent = async ({ pageParam = 0 }) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(pageParam * 20, (pageParam + 1) * 20 - 1);

    if (error) throw error;

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(p => p.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, is_verified, avatar_url')
          .in('id', userIds);
          
        return data.map(post => ({
          ...post,
          profiles: profiles?.find(p => p.id === post.user_id) || null
        }));
      }
    }
    return data || [];
  };`;

code = code.replace(targetFetch, replacementFetch);
fs.writeFileSync('src/pages/Explore.tsx', code);
