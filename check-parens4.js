import fs from 'fs';
const content = fs.readFileSync('script.js', 'utf8');

let parenCount = 0;
let inString = false;
let stringChar = '';
let inComment = false;
let inMultiComment = false;
let inTemplate = false;

let lastParenLine = -1;

const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const nextChar = line[j + 1] || '';
    const prevChar = line[j - 1] || '';

    if (!inString && !inComment && !inMultiComment && !inTemplate) {
      if (char === '/' && nextChar === '/') {
        break;
      } else if (char === '/' && nextChar === '*') {
        inMultiComment = true;
        j++;
      } else if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
      } else if (char === '`') {
        inTemplate = true;
      } else if (char === '(') {
        parenCount++;
        lastParenLine = i;
      } else if (char === ')') {
        parenCount--;
      }
    } else if (inString) {
      if (char === stringChar && prevChar !== '\\') inString = false;
    } else if (inTemplate) {
      if (char === '`' && prevChar !== '\\') inTemplate = false;
      else if (char === '$' && nextChar === '{') {
         // rough handle
      }
    } else if (inMultiComment) {
      if (char === '*' && nextChar === '/') {
        inMultiComment = false;
        j++;
      }
    }
  }
}
console.log(`Final parens: ${parenCount}, last open paren line: ${lastParenLine + 1}`);
