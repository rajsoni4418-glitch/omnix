const fs = require('fs');
let code = fs.readFileSync('src/components/story/StoryCreator.tsx', 'utf8');

if (!code.includes('const audioRef = useRef<HTMLAudioElement | null>(null);')) {
  code = code.replace(
    'const fileInputRef = useRef<HTMLInputElement>(null);',
    'const fileInputRef = useRef<HTMLInputElement>(null);\n  const audioRef = useRef<HTMLAudioElement | null>(null);'
  );

  const audioEffect = `
  useEffect(() => {
    if (selectedMusic && selectedMusic.previewUrl) {
      const audio = new Audio(selectedMusic.previewUrl);
      audio.loop = true;
      audio.currentTime = selectedMusic.startTime || 0;
      audio.play().catch(e => console.error('Audio play error:', e));
      audioRef.current = audio;
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedMusic]);
`;
  
  code = code.replace(
    'useEffect(() => {',
    audioEffect + '\n  useEffect(() => {'
  );

  code = code.replace(
    'const handleRemoveMusic = () => {',
    `const handleRemoveMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }`
  );
  
  fs.writeFileSync('src/components/story/StoryCreator.tsx', code);
}
