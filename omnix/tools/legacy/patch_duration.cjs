const fs = require('fs');
let code = fs.readFileSync('src/components/story/MusicPicker.tsx', 'utf8');

const target = `const handleCanPlay = () => {
        setIsAudioLoading(false);
        setDuration(audio.duration || 30); // Jamendo previews are usually 30s
      };`;

const replacement = `const handleCanPlay = () => {
        setIsAudioLoading(false);
        const dur = audio.duration || 30;
        setDuration(dur); // Jamendo previews are usually 30s
        if (trimmingTrack.startTime !== undefined && trimStart === 0) {
           setTrimStart((trimmingTrack.startTime / dur) * 100);
           audio.currentTime = trimmingTrack.startTime;
        }
      };`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/story/MusicPicker.tsx', code);
