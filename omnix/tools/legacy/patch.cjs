const fs = require('fs');

let code = fs.readFileSync('src/components/story/StoryCreator.tsx', 'utf8');

if (!code.includes('showMusicOptions')) {
  code = code.replace(
    'const [showMusicPicker, setShowMusicPicker] = useState(false);',
    'const [showMusicPicker, setShowMusicPicker] = useState(false);\n  const [showMusicOptions, setShowMusicOptions] = useState(false);'
  );

  code = code.replace(
    'const handleMusicSelect = (track: any) => {',
    `const handleRemoveMusic = () => {
    setSelectedMusic(null);
    setShowMusicOptions(false);
  };

  const handleMusicSelect = (track: any) => {`
  );

  code = code.replace(
    '<button onClick={() => setShowMusicPicker(true)} className="p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40">',
    '<button onClick={() => selectedMusic ? setShowMusicOptions(true) : setShowMusicPicker(true)} className="p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40">'
  );

  code = code.replace(
    'className="absolute bg-white/10 backdrop-blur-xl text-white font-medium rounded-2xl p-2 pr-4 cursor-grab active:cursor-grabbing flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 group/music z-40"',
    'className="absolute bg-white/10 backdrop-blur-xl text-white font-medium rounded-2xl p-2 pr-4 cursor-grab active:cursor-grabbing flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 group/music z-40" onClick={() => setShowMusicOptions(true)}'
  );

  const optionsMenu = `
      <AnimatePresence>
        {showMusicOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end justify-center bg-black/50"
            onClick={() => setShowMusicOptions(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-zinc-950 rounded-t-3xl p-6 flex flex-col gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-4" />
              <button
                onClick={() => { setShowMusicOptions(false); setShowMusicPicker(true); }}
                className="w-full py-4 bg-zinc-900 rounded-xl text-white font-bold hover:bg-zinc-800 transition-colors"
              >
                Change Music
              </button>
              <button
                onClick={() => { setShowMusicOptions(false); setShowMusicPicker(true); }}
                className="w-full py-4 bg-zinc-900 rounded-xl text-white font-bold hover:bg-zinc-800 transition-colors"
              >
                Edit Clip
              </button>
              <button
                onClick={handleRemoveMusic}
                className="w-full py-4 bg-red-500/10 text-red-500 rounded-xl font-bold hover:bg-red-500/20 transition-colors"
              >
                Remove Music
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
`;

  code = code.replace(
    '        {showMusicPicker && (',
    optionsMenu + '\n        {showMusicPicker && ('
  );
  
  // Also pass initialTrack to MusicPicker
  code = code.replace(
    '<MusicPicker onSelect={handleMusicSelect} onClose={() => setShowMusicPicker(false)} />',
    '<MusicPicker onSelect={handleMusicSelect} onClose={() => setShowMusicPicker(false)} initialTrack={selectedMusic} />'
  );
  
  fs.writeFileSync('src/components/story/StoryCreator.tsx', code);
}
