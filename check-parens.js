import fs from 'fs';
const content = fs.readFileSync('script.js', 'utf8');

let parenCount = 0;
let braceCount = 0;
let inString = false;
let stringChar = '';
let inComment = false;
let inMultiComment = false;
let inTemplate = false;

const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const nextChar = line[j + 1] || '';
    const prevChar = line[j - 1] || '';

    if (!inString && !inComment && !inMultiComment && !inTemplate) {
      if (char === '/' && nextChar === '/') {
        break; // skip rest of line
      } else if (char === '/' && nextChar === '*') {
        inMultiComment = true;
        j++;
      } else if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
      } else if (char === '`') {
        inTemplate = true;
      } else if (char === '{') braceCount++;
      else if (char === '}') braceCount--;
      else if (char === '(') parenCount++;
      else if (char === ')') parenCount--;
    } else if (inString) {
      if (char === stringChar && prevChar !== '\\') inString = false;
    } else if (inTemplate) {
      if (char === '`' && prevChar !== '\\') inTemplate = false;
      else if (char === '$' && nextChar === '{') {
        // template expression - not handling fully but good enough?
      }
    } else if (inMultiComment) {
      if (char === '*' && nextChar === '/') {
        inMultiComment = false;
        j++;
      }
    }
  }
  if (parenCount !== 0) {
     // Wait, it might just be inside a multiline parens. Let's just track parens at end of line.
  }
}
console.log(`Final parens: ${parenCount}, Braces: ${braceCount}`);
