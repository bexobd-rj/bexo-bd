const fs = require('fs');
const code = fs.readFileSync('index.html', 'utf-8');
const regex = /completeRegistration/g;
let match;
while ((match = regex.exec(code)) !== null) {
    const start = Math.max(0, match.index - 50);
    const end = Math.min(code.length, match.index + 50);
    console.log(`\nMatch at ${match.index}:`);
    console.log(code.substring(start, end));
}
