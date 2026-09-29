import fs from 'fs';
let code = fs.readFileSync('src/components/engagement/ReactionsRow.tsx', 'utf8');

const fetchStart = "  const fetchReactions = async () => {\n    try {";
const newFetch = `  const fetchReactions = async () => {
    // Prevent repeated 404s if we know the table is missing
    if (window.__REACTIONS_MISSING) return;
    try {`;
    
code = code.replace(fetchStart, newFetch);

const catchBlock = `if (error && error.message.includes('find the table')) {
             console.warn('Reactions table missing, migration needed.');
        }`;
const newCatchBlock = `if (error && error.message.includes('find the table')) {
             window.__REACTIONS_MISSING = true;
             console.warn('Reactions table missing, migration needed.');
        }`;

code = code.replace(catchBlock, newCatchBlock);
code = code.replace(catchBlock, newCatchBlock);

fs.writeFileSync('src/components/engagement/ReactionsRow.tsx', code);

let ts_global = fs.readFileSync('src/types.ts', 'utf8');
if (!ts_global.includes('__REACTIONS_MISSING')) {
  ts_global += "\ndeclare global {\n  interface Window {\n    __REACTIONS_MISSING?: boolean;\n  }\n}\n";
  fs.writeFileSync('src/types.ts', ts_global);
}

