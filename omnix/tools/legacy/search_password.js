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
      if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.sql') || file.endsWith('.json') || file.endsWith('.env')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('postgres://') || content.includes('db_pass') || content.toLowerCase().includes('password')) {
          console.log(`Found in: ${fullPath}`);
        }
      }
    }
  }
}

search('.');
