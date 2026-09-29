const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

code = code.replace(/story\.media_type === 'video'/g, `(story.media_url?.endsWith('.mp4') || story.media_url?.endsWith('.webm'))`);

fs.writeFileSync('src/pages/Profile.tsx', code);
