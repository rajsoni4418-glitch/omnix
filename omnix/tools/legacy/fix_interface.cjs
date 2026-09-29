const fs = require('fs');

let code = fs.readFileSync('src/components/story/MusicPicker.tsx', 'utf8');

code = code.replace(
  'startTime?: number; // for trimming',
  'startTime?: number; // for trimming\n  trimDuration?: number;'
);

code = code.replace(
  'duration: Math.min(30, audioRef.current?.duration || 30)',
  'trimDuration: Math.min(30, audioRef.current?.duration || 30)'
);

fs.writeFileSync('src/components/story/MusicPicker.tsx', code);
