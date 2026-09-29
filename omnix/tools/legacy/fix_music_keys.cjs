const fs = require('fs');
let code = fs.readFileSync('src/components/story/MusicPicker.tsx', 'utf8');
code = code.replace(/\{tracks\.map\(\(track\) => \(/g, '{tracks.map((track, i) => (');
code = code.replace(/key=\{track\.id\}/g, 'key={`${track.id}-${i}`}');
fs.writeFileSync('src/components/story/MusicPicker.tsx', code);
