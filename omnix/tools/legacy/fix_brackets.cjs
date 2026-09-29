const fs = require('fs');
let code = fs.readFileSync('src/components/StoriesBar.tsx', 'utf8');
code = code.replace(/group\.stories\.push\(story\);\n      \}\n    \}\);/g, `group.stories.push(story);\n    });`);
fs.writeFileSync('src/components/StoriesBar.tsx', code);
