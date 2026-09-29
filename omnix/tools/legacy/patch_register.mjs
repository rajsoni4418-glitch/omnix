import fs from 'fs';
let code = fs.readFileSync('src/pages/Register.tsx', 'utf8');

if (!code.includes('logLoginAttempt')) {
  code = code.replace("import { supabase } from '../lib/supabase';", "import { supabase } from '../lib/supabase';\nimport { logLoginAttempt } from '../lib/security';");
  
  code = code.replace("if (signUpError) throw signUpError;", "if (signUpError) throw signUpError;\n      if (data?.user) await logLoginAttempt(data.user.id, true);");
  
  fs.writeFileSync('src/pages/Register.tsx', code);
}
