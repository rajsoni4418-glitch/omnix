const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');
code = code.replace(
  "if (uploadRes.error && uploadRes.error.message.includes('not found') || uploadRes.error.message.includes('bucket')) {",
  "if (uploadRes.error && uploadRes.error.message && (uploadRes.error.message.includes('not found') || uploadRes.error.message.includes('bucket'))) {"
);
fs.writeFileSync('src/lib/storage.ts', code);
