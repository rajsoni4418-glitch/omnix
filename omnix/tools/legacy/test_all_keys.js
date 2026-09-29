import dotenv from 'dotenv';
dotenv.config();

console.log('All process.env keys:', Object.keys(process.env).filter(k => !k.startsWith('npm_') && !k.startsWith('COLOR') && !k.startsWith('LANG') && !k.startsWith('TERM') && !k.startsWith('NODE_')));
