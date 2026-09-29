const fs = require('fs');
let code = fs.readFileSync('src/components/story/StoryViewer.tsx', 'utf8');

const target1 = "const storyDuration = 5000; // 5 seconds for images";
const replacement1 = `  // Calculate dynamic duration
  let dynamicDuration = 5000;
  if (currentStory) {
    let track = null;
    if (currentStory.music) {
      try { track = JSON.parse(currentStory.music); } catch(e){}
    } else if (currentStory.caption && currentStory.caption.includes('|||MUSIC|||')) {
      try { track = JSON.parse(currentStory.caption.split('|||MUSIC|||')[1]); } catch(e){}
    }
    if (track && track.trimDuration) {
      dynamicDuration = track.trimDuration * 1000; // use selected music duration
    }
  }
  const storyDuration = dynamicDuration;`;

code = code.replace(target1, replacement1);

// Need to update the audio playback end time logic so it restarts exactly at the right time
// currently it looks like:
const effectTarget = `    if (track) {
      try {
        const parsedMusic = track;
        setMusicTrack(parsedMusic);
        
        if (parsedMusic.previewUrl && !isMuted) {
          const audio = new Audio(parsedMusic.previewUrl);
          audio.currentTime = parsedMusic.startTime || 0;
          audio.play().catch(e => console.error('Audio play error:', e));
          audioRef.current = audio;
        }
      } catch (err) {
        console.error('Failed to parse music', err);
      }`;

const effectReplacement = `    if (track) {
      try {
        const parsedMusic = track;
        setMusicTrack(parsedMusic);
        
        if (parsedMusic.previewUrl && !isMuted) {
          const audio = new Audio(parsedMusic.previewUrl);
          audio.currentTime = parsedMusic.startTime || 0;
          
          const handleTimeUpdate = () => {
            const endTime = (parsedMusic.startTime || 0) + (parsedMusic.trimDuration || 15);
            if (audio.currentTime >= endTime) {
              audio.currentTime = parsedMusic.startTime || 0;
              audio.play().catch(e => {});
            }
          };
          audio.addEventListener('timeupdate', handleTimeUpdate);
          (audio as any)._handleTimeUpdate = handleTimeUpdate;
          
          audio.play().catch(e => console.error('Audio play error:', e));
          audioRef.current = audio;
        }
      } catch (err) {
        console.error('Failed to parse music', err);
      }`;
code = code.replace(effectTarget, effectReplacement);

const cleanupTarget = `    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };`;

const cleanupReplacement = `    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if ((audioRef.current as any)._handleTimeUpdate) {
           audioRef.current.removeEventListener('timeupdate', (audioRef.current as any)._handleTimeUpdate);
        }
        audioRef.current = null;
      }
    };`;
code = code.replace(cleanupTarget, cleanupReplacement);


fs.writeFileSync('src/components/story/StoryViewer.tsx', code);
