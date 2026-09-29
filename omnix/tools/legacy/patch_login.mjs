import fs from 'fs';
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');

if (!code.includes('logLoginAttempt')) {
  code = code.replace("import { supabase } from '../lib/supabase';", "import { supabase } from '../lib/supabase';\nimport { logLoginAttempt } from '../lib/security';");
  
  code = code.replace("if (error) throw error;", "if (error) {\n        throw error;\n      }\n      await logLoginAttempt(data.user.id, true);");
  
  code = code.replace("const { error } = await supabase.auth.signInWithPassword({", "const { data, error } = await supabase.auth.signInWithPassword({");
  
  fs.writeFileSync('src/pages/Login.tsx', code);
}
