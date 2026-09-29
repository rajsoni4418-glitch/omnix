const fs = require('fs');
let code = fs.readFileSync('src/components/story/StoryCreator.tsx', 'utf8');

// 1. Add Trash2 to lucide imports
if (!code.includes('Trash2')) {
  code = code.replace(/X, Image as ImageIcon, Zap/, 'X, Image as ImageIcon, Zap, Trash2');
}

// 2. Add isDraggingMusic and trash hover states
if (!code.includes('isDraggingMusic')) {
  code = code.replace(
    'const [isAiProcessing, setIsAiProcessing] = useState(false);',
    'const [isAiProcessing, setIsAiProcessing] = useState(false);\n  const [isDraggingMusic, setIsDraggingMusic] = useState(false);\n  const [isOverTrash, setIsOverTrash] = useState(false);\n  const trashRef = useRef<HTMLDivElement>(null);'
  );
}

// 3. Update Selected Music Sticker drag events
const musicStickerRegex = /<motion\.div\s+drag\s+dragMomentum={false}/;
if (musicStickerRegex.test(code)) {
  code = code.replace(
    musicStickerRegex,
    `<motion.div
                drag
                dragMomentum={false}
                onDragStart={() => setIsDraggingMusic(true)}
                onDrag={(event, info) => {
                  if (trashRef.current) {
                    const rect = trashRef.current.getBoundingClientRect();
                    const isOver = info.point.x > rect.left && info.point.x < rect.right && info.point.y > rect.top && info.point.y < rect.bottom;
                    setIsOverTrash(isOver);
                  }
                }}
                onDragEnd={(event, info) => {
                  setIsDraggingMusic(false);
                  if (isOverTrash) {
                    handleRemoveMusic();
                  }
                  setIsOverTrash(false);
                }}`
  );
}

// 4. Add the Trash UI zone
const trashUI = `
            {/* Trash Dropzone for Music */}
            <AnimatePresence>
              {isDraggingMusic && (
                <motion.div
                  ref={trashRef}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0, scale: isOverTrash ? 1.5 : 1 }}
                  exit={{ opacity: 0, y: 50 }}
                  className={\`absolute bottom-32 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center z-50 transition-colors \${isOverTrash ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'bg-black/50 backdrop-blur-md text-white/80 border border-white/20'}\`}
                >
                  <Trash2 className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
`;

const textOverlayRegex = /\{\/\* Text Input Overlay \*\/\}/;
code = code.replace(textOverlayRegex, trashUI + '\n        {/* Text Input Overlay */}');

fs.writeFileSync('src/components/story/StoryCreator.tsx', code);
