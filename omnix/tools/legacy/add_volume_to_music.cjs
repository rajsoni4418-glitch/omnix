const fs = require('fs');
let code = fs.readFileSync('src/components/story/MusicPicker.tsx', 'utf8');

// Add volume to MusicTrack interface
code = code.replace(
  'trimDuration?: number;',
  'trimDuration?: number;\n  volume?: number;'
);

// Add state
code = code.replace(
  'const [trimDuration, setTrimDuration] = useState(15); // seconds',
  'const [trimDuration, setTrimDuration] = useState(15); // seconds\n  const [trimVolume, setTrimVolume] = useState(1); // 0.0 to 1.0'
);

// Add initialization
code = code.replace(
  'if (initialTrack.trimDuration !== undefined) {\n        setTrimDuration(initialTrack.trimDuration);\n      }',
  'if (initialTrack.trimDuration !== undefined) {\n        setTrimDuration(initialTrack.trimDuration);\n      }\n      if (initialTrack.volume !== undefined) {\n        setTrimVolume(initialTrack.volume);\n      }'
);

// Sync volume to audio element
code = code.replace(
  'audio.currentTime = initialTrack.startTime || 0;\n        }',
  'audio.currentTime = initialTrack.startTime || 0;\n        }\n        audio.volume = trimVolume;'
);

code = code.replace(
  'const handleTrimStartChange = (val: number) => {',
  'const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n    const vol = parseFloat(e.target.value);\n    setTrimVolume(vol);\n    if (audioRef.current) audioRef.current.volume = vol;\n  };\n\n  const handleTrimStartChange = (val: number) => {'
);

// On done
code = code.replace(
  'trimDuration: trimDuration',
  'trimDuration: trimDuration,\n        volume: trimVolume'
);

// Add volume UI
const ui = `
                <div className="flex items-center gap-3 w-full px-2">
                  <div className="text-zinc-500 text-xs font-medium">Vol</div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={trimVolume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="text-zinc-500 text-xs font-mono w-8 text-right">{Math.round(trimVolume * 100)}%</div>
                </div>
`;

code = code.replace(
  '<div className="flex items-center gap-2 text-zinc-500 text-xs mt-2">',
  ui + '\n                <div className="flex items-center gap-2 text-zinc-500 text-xs mt-2">'
);

fs.writeFileSync('src/components/story/MusicPicker.tsx', code);

let viewerCode = fs.readFileSync('src/components/story/StoryViewer.tsx', 'utf8');
viewerCode = viewerCode.replace(
  'audio.currentTime = parsedMusic.startTime || 0;',
  'audio.currentTime = parsedMusic.startTime || 0;\n          audio.volume = parsedMusic.volume !== undefined ? parsedMusic.volume : 1;'
);
fs.writeFileSync('src/components/story/StoryViewer.tsx', viewerCode);

let creatorCode = fs.readFileSync('src/components/story/StoryCreator.tsx', 'utf8');
creatorCode = creatorCode.replace(
  'audio.currentTime = selectedMusic.startTime || 0;',
  'audio.currentTime = selectedMusic.startTime || 0;\n      audio.volume = selectedMusic.volume !== undefined ? selectedMusic.volume : 1;'
);
fs.writeFileSync('src/components/story/StoryCreator.tsx', creatorCode);

