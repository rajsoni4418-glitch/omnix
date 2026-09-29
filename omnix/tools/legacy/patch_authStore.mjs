import fs from 'fs';

let code = fs.readFileSync('src/store/authStore.ts', 'utf8');

const regex = /\/\/ 2\. If no profile exists[\s\S]*?if \(profile\) \{/;
const replacement = `// 2. If no profile exists, it might be due to replication lag of the trigger.
        if (!profile && currentSession.user.email) {
          let username = currentSession.user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
          if (!username) username = 'user';
          username = username.slice(0, 24) + '_' + Date.now().toString().slice(-4);
          
          // Use a dummy profile to prevent app from breaking, while DB trigger finishes in background
          profile = { id: currentSession.user.id, username, display_name: username, role: 'user', is_verified: false };
        }
        
        if (profile) {`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/store/authStore.ts', code);
