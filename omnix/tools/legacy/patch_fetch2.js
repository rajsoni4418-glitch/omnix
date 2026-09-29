import fs from 'fs';
let code = fs.readFileSync('src/components/engagement/ReactionsRow.tsx', 'utf8');

code = code.replace(/window\.__REACTIONS_MISSING/g, "(window as any).__REACTIONS_MISSING");

fs.writeFileSync('src/components/engagement/ReactionsRow.tsx', code);
