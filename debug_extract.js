const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');
const scriptContent = lines.slice(1502, 10756).join('\n');
fs.writeFileSync('script_to_check.js', scriptContent);
console.log('Script extracted.');
