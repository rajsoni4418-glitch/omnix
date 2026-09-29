import fs from 'fs';
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

const regex = /if \(!response\.ok\) \{[\s\S]*?logger\.warn\('API Request Failed', \{ url: urlStr, status: response\.status, statusText: response\.statusText \}\);\n    \}/;

const newCode = `if (!response.ok) {
       const urlStr = typeof url === 'string' ? url : (url as any).url || url.toString();
       if (!(urlStr.includes('/reactions') && response.status === 404)) {
         logger.warn('API Request Failed', { url: urlStr, status: response.status, statusText: response.statusText });
       }
    }`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/lib/supabase.ts', code);
