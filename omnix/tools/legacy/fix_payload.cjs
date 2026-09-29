const fs = require('fs');

let code = fs.readFileSync('src/components/story/StoryCreator.tsx', 'utf8');

const oldPayload = `      const payload = {
        user_id: user.id,
        media_url: publicUrl || 'https://via.placeholder.com/1080x1920/111111/FFFFFF?text=Text+Story',
        caption: captionText,
        expires_at: expiresAt.toISOString(),
      };`;

const newPayload = `      const payload = {
        user_id: user.id,
        media_url: publicUrl || 'https://via.placeholder.com/1080x1920/111111/FFFFFF?text=Text+Story',
        caption: captionText,
        expires_at: expiresAt.toISOString(),
        ...(selectedMusic ? { music: JSON.stringify(selectedMusic) } : {})
      };`;

code = code.replace(oldPayload, newPayload);
fs.writeFileSync('src/components/story/StoryCreator.tsx', code);

let storageCode = fs.readFileSync('src/lib/storage.ts', 'utf8');
storageCode = storageCode.replace(/includes\('Bucket not found'\)/g, "includes('not found') || uploadRes.error.message.includes('bucket')");
fs.writeFileSync('src/lib/storage.ts', storageCode);

