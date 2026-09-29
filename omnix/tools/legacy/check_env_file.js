import fs from 'fs';
import path from 'path';

async function run() {
  const p = path.resolve('.env');
  console.log('Path:', p);
  console.log('Exists:', fs.existsSync(p));
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    console.log('Keys in .env:');
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const parts = line.split('=');
        console.log(`- ${parts[0]}`);
      }
    }
  }
}
run();
