const fs = require('fs');
let code = fs.readFileSync('src/components/story/StoryViewer.tsx', 'utf8');

const effectTarget = `  useEffect(() => {
    if (!currentStory) return;
    
    setProgress(0);
    clearInterval(progressInterval.current);`;

const newEffect = `  useEffect(() => {
    if (!currentStory) return;
    
    if (currentStory.music) {
      try {
        const parsedMusic = JSON.parse(currentStory.music);
        setMusicTrack(parsedMusic);
        
        if (parsedMusic.previewUrl && !isMuted) {
          const audio = new Audio(parsedMusic.previewUrl);
          audio.currentTime = parsedMusic.startTime || 0;
          audio.volume = 0.5;
          audio.play().catch(e => console.error("Audio playback blocked", e));
          audioRef.current = audio;
          
          const handleTimeUpdate = () => {
            const endTime = (parsedMusic.startTime || 0) + (parsedMusic.duration || 30);
            if (audio.currentTime >= endTime) {
              audio.currentTime = parsedMusic.startTime || 0;
              audio.play().catch(e => {});
            }
          };
          audio.addEventListener('timeupdate', handleTimeUpdate);
          audioRef.current._handleTimeUpdate = handleTimeUpdate;
        }
      } catch (e) {
        console.error("Failed to parse music", e);
        setMusicTrack(null);
      }
    } else {
      setMusicTrack(null);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current._handleTimeUpdate) {
          audioRef.current.removeEventListener('timeupdate', audioRef.current._handleTimeUpdate);
        }
        audioRef.current = null;
      }
    };
  }, [currentStory, isMuted]);

  useEffect(() => {
    if (!currentStory) return;
    
    setProgress(0);
    clearInterval(progressInterval.current);`;

code = code.replace(effectTarget, newEffect);

if (!code.includes('Music className=')) {
  const stickerTarget = `          {/* Reactions Overlay */}`;
  const newSticker = `
          {musicTrack && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl text-white font-medium rounded-2xl p-2 pr-4 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 z-40">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shrink-0">
                  <img src={musicTrack.coverUrl} className="w-full h-full object-cover animate-[spin_10s_linear_infinite]" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Music className="w-4 h-4 text-white drop-shadow-md" />
                  </div>
                </div>
                <div className="flex flex-col items-start min-w-[100px] max-w-[160px] mr-2">
                  <span className="font-bold text-sm truncate w-full shadow-black drop-shadow-sm">{musicTrack.title}</span>
                  <span className="text-[10px] text-white/80 truncate w-full">{musicTrack.artist}</span>
                </div>
            </div>
          )}

          {/* Reactions Overlay */}`;
  code = code.replace(stickerTarget, newSticker);
}

fs.writeFileSync('src/components/story/StoryViewer.tsx', code);
