import fs from 'fs';
let code = fs.readFileSync('src/components/engagement/ReactionsRow.tsx', 'utf8');

const regex = /const fetchReactions = async \(\) => \{[\s\S]*?\} catch \(err\) \{[\s\S]*?console\.error\('Error fetching reactions', err\);\n    \}\n  \};/;

const newFetchReactions = `const fetchReactions = async () => {
    if ((window as any).__REACTIONS_MISSING) return;
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('post_id', post.id);
        
      if (error) {
        if (error.message.includes('find the table') || error.message.includes('relation') || error.message.includes('does not exist')) {
          (window as any).__REACTIONS_MISSING = true;
          return;
        }
        throw error;
      }
      
      setReactions(data || []);
      
      if (user) {
        const ur = (data || []).find(r => r.user_id === user.id);
        setUserReaction(ur ? ur.reaction_type : null);
      }
    } catch (err: any) {
      if (err?.message?.includes('find the table') || err?.message?.includes('does not exist')) {
        (window as any).__REACTIONS_MISSING = true;
        return;
      }
      console.warn('Error fetching reactions', err);
    }
  };`;

code = code.replace(regex, newFetchReactions);
fs.writeFileSync('src/components/engagement/ReactionsRow.tsx', code);
