const fs = require('fs');

let sc = fs.readFileSync('src/components/story/StoryCreator.tsx', 'utf8');
sc = sc.replace(/selectedMusic\.duration/g, 'selectedMusic.trimDuration');
fs.writeFileSync('src/components/story/StoryCreator.tsx', sc);

let sv = fs.readFileSync('src/components/story/StoryViewer.tsx', 'utf8');
sv = sv.replace(/parsedMusic\.duration/g, 'parsedMusic.trimDuration');
fs.writeFileSync('src/components/story/StoryViewer.tsx', sv);

