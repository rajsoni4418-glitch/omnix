import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.VITE_SUPABASE_URL
  ? process.env.VITE_SUPABASE_URL.replace('https://', 'postgres://postgres:').replace('.supabase.co', '') // wait, what's the db password?
  : null;
// Wait, I don't have the DB password. I can't connect directly via pg without the password.
