import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
supabase.rpc('exec_sql', { query: "SELECT column_name FROM information_schema.columns WHERE table_name = 'comments';" }).then(console.log).catch(console.error);
