const fs = require('fs');
const acorn = require('acorn');
const htmlContent = fs.readFileSync('index.html', 'utf8');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let lineNumber = 1;

while ((match = scriptRegex.exec(htmlContent)) !== null) {
  const code = match[1];
  const offset = htmlContent.substring(0, match.index).split('\n').length;
  try {
    acorn.parse(code, { ecmaVersion: 2020 });
  } catch (err) {
    console.log(`Error in script starting at line ${offset}:`, err.message);
  }
}
