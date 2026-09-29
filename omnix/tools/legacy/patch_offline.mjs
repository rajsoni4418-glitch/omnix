import fs from 'fs';

let code = fs.readFileSync('src/components/performance/OfflineIndicator.tsx', 'utf8');
code = code.replace("import { motion, AnimatePresence } from 'motion/react';", "// @ts-expect-error motion/react types missing\nimport { motion, AnimatePresence } from 'motion/react';");
fs.writeFileSync('src/components/performance/OfflineIndicator.tsx', code);
