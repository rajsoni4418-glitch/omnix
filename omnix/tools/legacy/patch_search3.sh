sed -i 's/users: post.profiles || { username: '"'"'unknown'"'"' }/users: profilesData.find(p => p.id === post.user_id) || { username: '"'"'unknown'"'"' }/g' src/pages/Search.tsx
