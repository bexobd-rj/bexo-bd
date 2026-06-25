import fs from 'fs';
let content = fs.readFileSync('index.html', 'utf8');

const regex = /\}\s*\n\s*\}\s*\n\s*function sendUserChatReply\(id\) \{/g;
content = content.replace(regex, '}\n\n               function sendUserChatReply(id) {');

fs.writeFileSync('index.html', content);
console.log("Fixed stray brace using regex");
