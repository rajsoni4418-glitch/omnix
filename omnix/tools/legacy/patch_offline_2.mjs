import fs from 'fs';

let code = fs.readFileSync('src/components/performance/OfflineIndicator.tsx', 'utf8');
code = code.replace("// @ts-expect-error motion/react types missing\n", "");
fs.writeFileSync('src/components/performance/OfflineIndicator.tsx', code);
