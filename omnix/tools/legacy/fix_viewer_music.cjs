const fs = require('fs');

let code = fs.readFileSync('src/components/story/StoryViewer.tsx', 'utf8');

const effectTarget = `  useEffect(() => {
    if (!currentStory) return;
    
    if (currentStory.music) {
      try {
        const parsedMusic = JSON.parse(currentStory.music);`;

const effectReplacement = `  useEffect(() => {
    if (!currentStory) return;
    
    let track = null;
    if (currentStory.music) {
      try { track = JSON.parse(currentStory.music); } catch(e){}
    } else if (currentStory.caption && currentStory.caption.includes('|||MUSIC|||')) {
      try { track = JSON.parse(currentStory.caption.split('|||MUSIC|||')[1]); } catch(e){}
    }

    if (track) {
      try {
        const parsedMusic = track;`;

code = code.replace(effectTarget, effectReplacement);

// Render caption safely
const captionTarget = `            {/* Caption Overlay */}
            {currentStory.caption && (
              <div className="absolute bottom-28 inset-x-8 text-center z-20 pointer-events-none">
                <div className="inline-block bg-black/60 text-white px-5 py-3 rounded-2xl text-lg font-medium backdrop-blur-md whitespace-pre-wrap shadow-xl border border-white/10">
                  {currentStory.caption}
                </div>
              </div>
            )}`;

const captionReplacement = `            {/* Caption Overlay */}
            {currentStory.caption && currentStory.caption.split('|||MUSIC|||')[0] && (
              <div className="absolute bottom-28 inset-x-8 text-center z-20 pointer-events-none">
                <div className="inline-block bg-black/60 text-white px-5 py-3 rounded-2xl text-lg font-medium backdrop-blur-md whitespace-pre-wrap shadow-xl border border-white/10">
                  {currentStory.caption.split('|||MUSIC|||')[0]}
                </div>
              </div>
            )}`;

code = code.replace(captionTarget, captionReplacement);

fs.writeFileSync('src/components/story/StoryViewer.tsx', code);
