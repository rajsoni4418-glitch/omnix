import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
// let's see if we can use an RPC to execute sql or just create a new RPC. 
// wait, the previous run_migration.js didn't use an API.
