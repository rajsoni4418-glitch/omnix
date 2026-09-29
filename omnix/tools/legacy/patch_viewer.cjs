const fs = require('fs');
let code = fs.readFileSync('src/components/story/StoryViewer.tsx', 'utf8');

code = code.replace(/media_type: 'image' \| 'video';/g, '');
code = code.replace(/currentStory\.media_type === 'video'/g, `(currentStory.media_url?.endsWith('.mp4') || currentStory.media_url?.endsWith('.webm'))`);

fs.writeFileSync('src/components/story/StoryViewer.tsx', code);
