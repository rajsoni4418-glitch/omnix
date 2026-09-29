import fs from 'fs';
let code = fs.readFileSync('src/components/engagement/ReactionsRow.tsx', 'utf8');

code = code.replace(
  "if (error && error.message.includes('find the table')) {\n             alert('Reactions feature requires database migration to be run.');\n        }",
  "if (error && error.message.includes('find the table')) {\n             console.warn('Reactions table missing, migration needed.');\n        }"
);

code = code.replace(
  "if (error && error.message.includes('find the table')) {\n             alert('Reactions feature requires database migration to be run.');\n        }",
  "if (error && error.message.includes('find the table')) {\n             console.warn('Reactions table missing, migration needed.');\n        }"
);

code = code.replace(
  "if (error && !error.message.includes('find the table')) throw error;",
  "if (error && !error.message.includes('find the table') && !error.message.includes('relation')) throw error;"
);

fs.writeFileSync('src/components/engagement/ReactionsRow.tsx', code);
