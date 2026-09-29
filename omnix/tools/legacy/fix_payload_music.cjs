const fs = require('fs');
let code = fs.readFileSync('src/components/story/StoryCreator.tsx', 'utf8');

const oldPayload = `      const payload = {
        user_id: user.id,
        media_url: publicUrl || 'https://via.placeholder.com/1080x1920/111111/FFFFFF?text=Text+Story',
        caption: captionText,
        expires_at: expiresAt.toISOString(),
        ...(selectedMusic ? { music: JSON.stringify(selectedMusic) } : {})
      };`;

const newPayload = `
      // Pack music into caption if necessary, since DB might lack music column
      const finalCaption = captionText 
        ? captionText + (selectedMusic ? '|||MUSIC|||' + JSON.stringify(selectedMusic) : '')
        : (selectedMusic ? '|||MUSIC|||' + JSON.stringify(selectedMusic) : null);

      const payload = {
        user_id: user.id,
        media_url: publicUrl || 'https://via.placeholder.com/1080x1920/111111/FFFFFF?text=Text+Story',
        caption: finalCaption,
        expires_at: expiresAt.toISOString()
      };`;

code = code.replace(oldPayload, newPayload);
fs.writeFileSync('src/components/story/StoryCreator.tsx', code);

let bar = fs.readFileSync('src/components/StoriesBar.tsx', 'utf8');
bar = bar.replace(/          music,\n/g, '');
fs.writeFileSync('src/components/StoriesBar.tsx', bar);

let prof = fs.readFileSync('src/pages/Profile.tsx', 'utf8');
prof = prof.replace(/, music/g, '');
fs.writeFileSync('src/pages/Profile.tsx', prof);
