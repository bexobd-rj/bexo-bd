const fs = require('fs');
let content = fs.readFileSync('main_script.js', 'utf8');

content = content.replace(/console\.log\(\`\[Manual Direct Sync\] Uploading missing local[\s\S]*?\}\);/g, '// Manual direct sync - DISABLED to save quota');

fs.writeFileSync('main_script.js', content);
