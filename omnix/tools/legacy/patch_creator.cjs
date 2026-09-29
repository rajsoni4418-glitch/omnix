const fs = require('fs');
let code = fs.readFileSync('src/components/story/StoryCreator.tsx', 'utf8');
code = code.replace(/const payload = {[\s\S]*?expires_at: expiresAt\.toISOString\(\),[\s\S]*?music:.*?[\s\S]*?};/, `const payload = {
        user_id: user.id,
        media_url: publicUrl || 'https://via.placeholder.com/1080x1920/111111/FFFFFF?text=Text+Story',
        caption: captionText,
        expires_at: expiresAt.toISOString(),
      };`);
      
code = code.replace(/if \(dbError\.message\.includes\('media_type'\)[\s\S]*?\} else if \(dbError\.code === '42501'\)/, `if (dbError.code === '42501')`);
fs.writeFileSync('src/components/story/StoryCreator.tsx', code);
