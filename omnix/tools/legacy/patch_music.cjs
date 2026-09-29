const fs = require('fs');

let code = fs.readFileSync('src/components/story/MusicPicker.tsx', 'utf8');

// Change signature to accept initialTrack
code = code.replace(
  'export default function MusicPicker({ onSelect, onClose }: { onSelect: (track: MusicTrack) => void, onClose: () => void }) {',
  'export default function MusicPicker({ onSelect, onClose, initialTrack }: { onSelect: (track: MusicTrack) => void, onClose: () => void, initialTrack?: MusicTrack | null }) {'
);

// Add initialTrack logic
if (!code.includes('useEffect(() => { if (initialTrack) {')) {
  code = code.replace(
    'const [favorites, setFavorites] = useState<string[]>([]);',
    `const [favorites, setFavorites] = useState<string[]>([]);
  
  useEffect(() => {
    if (initialTrack) {
      setTrimmingTrack(initialTrack);
      if (initialTrack.startTime !== undefined) {
        // Will be updated when audio loads and duration is known
        setTrimStart((initialTrack.startTime / 30) * 100); 
      }
    }
  }, [initialTrack]);`
  );
}

// 15 to 30 replacements
code = code.replace(/trimStartSec \+ 15/g, 'trimStartSec + 30');
code = code.replace(/15 \/ \(duration/g, '30 / (duration');
code = code.replace(/15s Clip/g, '30s Clip');
code = code.replace(/Drag to trim 15 seconds/g, 'Drag to trim 30 seconds');

// Cancel button to X icon
code = code.replace(
  '<button onClick={() => setTrimmingTrack(null)} className="text-white font-medium hover:text-zinc-300 transition-colors">Cancel</button>',
  '<button onClick={() => setTrimmingTrack(null)} className="p-2 text-white hover:bg-zinc-800 rounded-full transition-colors"><X className="w-6 h-6" /></button>'
);

// If there's an initial track, X should probably call onClose directly instead of setTrimmingTrack(null). 
code = code.replace(
  'onClick={() => setTrimmingTrack(null)}',
  'onClick={() => initialTrack ? onClose() : setTrimmingTrack(null)}'
);

fs.writeFileSync('src/components/story/MusicPicker.tsx', code);
