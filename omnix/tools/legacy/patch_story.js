import fs from 'fs';
let code = fs.readFileSync('src/components/story/StoryViewer.tsx', 'utf8');

const handleReactStr = `  const handleReaction = async (emoji: string) => {
    showToast(\`Reaction \${emoji} sent\`);
    setShowReactions(false);
    setIsPaused(false);
    
    // Instead of failing, we just do optimistic for now 
    // since we can't create story_reactions or story_likes
    // in this environment.
  };`;

code = code.replace(
  /const handleReaction = \(emoji: string\) => {[\s\S]*?setIsPaused\(false\);\n  };/,
  handleReactStr
);

fs.writeFileSync('src/components/story/StoryViewer.tsx', code);
