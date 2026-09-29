const fs = require('fs');
let code = fs.readFileSync('src/pages/settings/PermissionsCenter.tsx', 'utf8');

if (!code.includes('import AccountPrivacy')) {
  code = code.replace("import * as Icons from 'lucide-react';", "import * as Icons from 'lucide-react';\nimport AccountPrivacy from './AccountPrivacy';");
  
  // Find PrivacyDashboard function
  const regex = /function PrivacyDashboard\(\) \{[\s\S]*?return \(\s*<div className="space-y-6">/m;
  code = code.replace(regex, (match) => {
    return match + '\n      <AccountPrivacy />\n';
  });
  
  fs.writeFileSync('src/pages/settings/PermissionsCenter.tsx', code);
}
