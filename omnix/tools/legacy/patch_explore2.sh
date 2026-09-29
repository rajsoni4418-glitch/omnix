sed -i '/return data || \[\];/c\
    if (!data || data.length === 0) return [];\
\
    const userIds = [...new Set(data.map(p => p.user_id).filter(Boolean))];\
    let profilesMap: Record<string, any> = {};\
    if (userIds.length > 0) {\
      const { data: profilesData } = await supabase\
        .from('"'"'profiles'"'"')\
        .select('"'"'id, username, avatar_url, display_name, is_verified'"'"')\
        .in('"'"'id'"'"', userIds);\
\
      if (profilesData) {\
        profilesMap = profilesData.reduce((acc, p) => {\
          acc[p.id] = p;\
          return acc;\
        }, {} as Record<string, any>);\
      }\
    }\
\
    return data.map(post => ({\
      ...post,\
      profiles: profilesMap[post.user_id] || { username: '"'"'Unknown'"'"' }\
    }));\
' src/pages/Explore.tsx
