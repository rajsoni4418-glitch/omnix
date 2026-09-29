const fs = require('fs');

function replaceFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  
  content = content.replace(/await supabase\.from\('notification_events'\)\.insert\(\{([^}]+)\}\);/g, (match, p1) => {
    let recipient_id = '';
    let actor_id = '';
    let type = '';
    
    // Simple naive parsing for the given structure
    const getVal = (key) => {
      const regex = new RegExp(`${key}:\\s*([^,}]+)`);
      const m = p1.match(regex);
      return m ? m[1].trim() : '';
    };
    
    recipient_id = getVal('recipient_id');
    actor_id = getVal('actor_id');
    type = getVal('type');
    
    if (type === "'like'") {
      return `await supabase.from('notifications').insert({ user_id: ${recipient_id}, type: 'like', title: \`\${user.user_metadata?.username || 'Someone'} liked your post\` });`;
    } else if (type === "'comment'") {
      return `await supabase.from('notifications').insert({ user_id: ${recipient_id}, type: 'comment', title: \`\${user.user_metadata?.username || 'Someone'} commented on your post\` });`;
    } else if (type === "'reply'") {
      return `await supabase.from('notifications').insert({ user_id: ${recipient_id}, type: 'comment', title: \`\${user.user_metadata?.username || 'Someone'} replied to your comment\` });`;
    } else if (type === "'comment_like'") {
      return `await supabase.from('notifications').insert({ user_id: ${recipient_id}, type: 'like', title: \`\${user.user_metadata?.username || 'Someone'} liked your comment\` });`;
    } else if (type === "'share'") {
      return `await supabase.from('notifications').insert({ user_id: ${recipient_id}, type: 'share', title: \`\${user.user_metadata?.username || 'Someone'} shared your post\` });`;
    }
    return match;
  });

  fs.writeFileSync(path, content, 'utf8');
}

replaceFile('src/components/PostCard.tsx');
replaceFile('src/components/engagement/CommentsSheet.tsx');
replaceFile('src/components/engagement/ShareSheet.tsx');
