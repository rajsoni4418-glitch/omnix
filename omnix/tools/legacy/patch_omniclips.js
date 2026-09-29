import fs from 'fs';
let code = fs.readFileSync('src/pages/OmniClips.tsx', 'utf8');

const regex = /const fetchClips = async \(\{ pageParam = 0 \}\) => \{[\s\S]*?return processed;\n  \};/;

const newFetchClips = `const fetchClips = async ({ pageParam = 0 }) => {
    let query = supabase
      .from('omniclips')
      .select(\`
        id,
        video_url,
        thumbnail_url:thumbnail,
        caption,
        music_title:music,
        view_count:views,
        likes_count,
        comments_count,
        shares_count,
        created_at,
        user_id
      \`)
      .range(pageParam * 10, (pageParam + 1) * 10 - 1);
      
    if (searchQuery) {
      query = query.or(\`caption.ilike.%\${searchQuery}%,music.ilike.%\${searchQuery}%\`);
    } else if (feedType === 'trending') {
      query = query.order('likes_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
        
    if (error) {
      console.error('Supabase error fetching omniclips:', error);
      throw error;
    }

    if (!data || data.length === 0) return [];

    const userIds = [...new Set(data.map(c => c.user_id).filter(Boolean))];
    let profilesMap: Record<string, any> = {};
    
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, display_name:full_name, is_verified:verified, avatar_url')
        .in('id', userIds);
      
      if (profilesData) {
        profilesMap = profilesData.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);
      }
    }
    
    let userLikes = new Set();
    if (user && data && data.length > 0) {
      const clipIds = data.map(c => c.id);
      const { data: likesData } = await supabase
        .from('clip_likes')
        .select('clip_id')
        .in('clip_id', clipIds)
        .eq('user_id', user.id);
        
      if (likesData) {
        userLikes = new Set(likesData.map(l => l.clip_id));
      }
    }

    let processed = data.map(clip => ({
      ...clip,
      has_liked: userLikes.has(clip.id),
      profile: profilesMap[clip.user_id] || { 
        id: clip.user_id, 
        username: 'user_' + (clip.user_id?.substring(0, 5) || 'unknown'),
        display_name: 'Unknown User',
        avatar_url: null,
        is_verified: false
      }
    }));

    return processed;
  };`;

code = code.replace(regex, newFetchClips);
fs.writeFileSync('src/pages/OmniClips.tsx', code);
