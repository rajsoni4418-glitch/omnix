import fs from 'fs';
let code = fs.readFileSync('src/components/engagement/CommentsSheet.tsx', 'utf8');

code = code.replace(/content,/g, 'comment: content,');
code = code.replace(/comment\.content/g, 'comment.content || comment.comment');

fs.writeFileSync('src/components/engagement/CommentsSheet.tsx', code);
