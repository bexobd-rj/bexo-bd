const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let i = 1;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1];
  try {
    new Function(code);
    console.log(`Script ${i} is valid.`);
  } catch (e) {
    console.log(`Script ${i} has error:`, e.message);
    const lines = code.split('\n');
    // try to find the error line
    for (let j = 0; j < lines.length; j++) {
       try {
           new Function(lines.slice(0, j).join('\n'));
       } catch (err) {
           console.log(`Error around line ${j}: ${lines[j]}`);
           console.log(`Context: \n${lines.slice(Math.max(0, j-5), j+5).join('\n')}`);
           break;
       }
    }
  }
  i++;
}
