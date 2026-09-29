const fs = require('fs');

let sc = fs.readFileSync('src/components/story/StoryCreator.tsx', 'utf8');

sc = sc.replace(
  'const [showMusicPicker, setShowMusicPicker] = useState(false);',
  'const [showMusicPicker, setShowMusicPicker] = useState(false);\n  const [musicPickerMode, setMusicPickerMode] = useState<"new" | "edit">("new");'
);

// Edit Clip button
sc = sc.replace(
  '<button\n                onClick={() => { setShowMusicOptions(false); setShowMusicPicker(true); }}\n                className="w-full py-4 bg-zinc-900 rounded-xl text-white font-bold hover:bg-zinc-800 transition-colors"\n              >\n                Edit Clip\n              </button>',
  '<button\n                onClick={() => { setShowMusicOptions(false); setMusicPickerMode("edit"); setShowMusicPicker(true); }}\n                className="w-full py-4 bg-zinc-900 rounded-xl text-white font-bold hover:bg-zinc-800 transition-colors"\n              >\n                Edit Clip\n              </button>'
);

// Change Music button
sc = sc.replace(
  '<button\n                onClick={() => { setShowMusicOptions(false); setShowMusicPicker(true); }}\n                className="w-full py-4 bg-zinc-900 rounded-xl text-white font-bold hover:bg-zinc-800 transition-colors"\n              >\n                Change Music\n              </button>',
  '<button\n                onClick={() => { setShowMusicOptions(false); setMusicPickerMode("new"); setShowMusicPicker(true); }}\n                className="w-full py-4 bg-zinc-900 rounded-xl text-white font-bold hover:bg-zinc-800 transition-colors"\n              >\n                Change Music\n              </button>'
);

// New Music button
sc = sc.replace(
  '<button onClick={() => selectedMusic ? setShowMusicOptions(true) : setShowMusicPicker(true)}',
  '<button onClick={() => { if (selectedMusic) { setShowMusicOptions(true); } else { setMusicPickerMode("new"); setShowMusicPicker(true); } }}'
);

// MusicPicker props
sc = sc.replace(
  '<MusicPicker onSelect={handleMusicSelect} onClose={() => setShowMusicPicker(false)} initialTrack={selectedMusic} />',
  '<MusicPicker onSelect={handleMusicSelect} onClose={() => setShowMusicPicker(false)} initialTrack={musicPickerMode === "edit" ? selectedMusic : undefined} />'
);

fs.writeFileSync('src/components/story/StoryCreator.tsx', sc);

