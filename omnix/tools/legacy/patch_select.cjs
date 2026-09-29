const fs = require('fs');

function addMusicField(file, regexStr, replacement) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(new RegExp(regexStr, 'g'), replacement);
  fs.writeFileSync(file, code);
}

addMusicField('src/components/StoriesBar.tsx', 'caption,', 'caption,\n          music,');
addMusicField('src/pages/Profile.tsx', 'select\\(\'id, user_id, media_url, created_at, expires_at\'\\)', 'select(\'id, user_id, media_url, created_at, expires_at, music\')');

