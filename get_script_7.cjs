const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let i = 1;
while ((match = scriptRegex.exec(html)) !== null) {
  if (i === 7) {
    fs.writeFileSync('script7.js', match[1]);
    break;
  }
  i++;
}
