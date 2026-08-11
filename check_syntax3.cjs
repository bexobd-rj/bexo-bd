const fs = require('fs');
const acorn = require('acorn');

const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;

let match;
let i = 1;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1];
  if (code.trim()) {
    try {
      acorn.parse(code, { ecmaVersion: 2022, sourceType: 'module' });
    } catch (e) {
      const matchIndex = match.index;
      const preMatch = html.substring(0, matchIndex);
      const startLine = preMatch.split('\n').length;
      console.error('Error in index.html around line: ' + (startLine + e.loc.line));
      const lines = code.split('\n');
      const errorLine = e.loc.line - 1;
      console.error('Context:', lines.slice(Math.max(0, errorLine - 2), errorLine + 3).join('\n'));
    }
  }
  i++;
}
