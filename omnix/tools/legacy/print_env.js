import dotenv from 'dotenv';
dotenv.config();
console.log(Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('DB') || k.includes('POSTGRES') || k.includes('SQL')));
