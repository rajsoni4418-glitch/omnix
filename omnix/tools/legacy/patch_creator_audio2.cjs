const fs = require('fs');
let code = fs.readFileSync('src/components/story/StoryCreator.tsx', 'utf8');

const target = `  useEffect(() => {
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
  }, [selectedMusic]);`;

const replacement = `  useEffect(() => {
    if (selectedMusic && selectedMusic.previewUrl) {
      const audio = new Audio(selectedMusic.previewUrl);
      audio.currentTime = selectedMusic.startTime || 0;
      audio.play().catch(e => console.error('Audio play error:', e));
      audioRef.current = audio;
      
      const handleTimeUpdate = () => {
        const endTime = (selectedMusic.startTime || 0) + (selectedMusic.duration || 30);
        if (audio.currentTime >= endTime) {
          audio.currentTime = selectedMusic.startTime || 0;
          audio.play().catch(e => {});
        }
      };
      audio.addEventListener('timeupdate', handleTimeUpdate);
      
      // Store reference to cleanup listener
      audioRef.current._handleTimeUpdate = handleTimeUpdate;
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current._handleTimeUpdate) {
          audioRef.current.removeEventListener('timeupdate', audioRef.current._handleTimeUpdate);
        }
        audioRef.current = null;
      }
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
  }, [selectedMusic]);`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/story/StoryCreator.tsx', code);
