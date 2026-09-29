const fs = require('fs');

let mp = fs.readFileSync('src/components/story/MusicPicker.tsx', 'utf8');
mp = mp.replace('max={maxTrimStart}', 'max={maxTrimStart.toString()}');
fs.writeFileSync('src/components/story/MusicPicker.tsx', mp);

let sc = fs.readFileSync('src/components/story/StoryCreator.tsx', 'utf8');
sc = sc.replace(/audioRef\.current\._handleTimeUpdate/g, '(audioRef.current as any)._handleTimeUpdate');
fs.writeFileSync('src/components/story/StoryCreator.tsx', sc);

let sv = fs.readFileSync('src/components/story/StoryViewer.tsx', 'utf8');
sv = sv.replace(/audioRef\.current\._handleTimeUpdate/g, '(audioRef.current as any)._handleTimeUpdate');
fs.writeFileSync('src/components/story/StoryViewer.tsx', sv);

