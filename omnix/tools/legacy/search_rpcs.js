import fs from 'fs';
import path from 'path';

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
    
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      search(fullPath);
    } else {
      if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const regex = /\.rpc\s*\(\s*['"`](.*?)['"`]/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
          console.log(`Found RPC: "${match[1]}" in ${fullPath}`);
        }
      }
    }
  }
}

search('.');
