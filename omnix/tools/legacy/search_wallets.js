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
      if (file.endsWith('.sql') || file.endsWith('.js') || file.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.toLowerCase().includes('wallet_transactions') || content.toLowerCase().includes('wallets')) {
          console.log(`Found in: ${fullPath}`);
        }
      }
    }
  }
}

search('.');
