const fs = require('fs');

let code = fs.readFileSync('src/components/story/MusicPicker.tsx', 'utf8');

const target = `      onSelect({
        ...trimmingTrack,
        startTime: trimStartSec
      });`;

const replacement = `      onSelect({
        ...trimmingTrack,
        startTime: trimStartSec,
        duration: Math.min(30, audioRef.current?.duration || 30)
      });`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/story/MusicPicker.tsx', code);
