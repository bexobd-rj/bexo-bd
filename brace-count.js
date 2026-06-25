import fs from 'fs';

const code = fs.readFileSync('script.js', 'utf8');

let braceCount = 0;
let parenCount = 0;
let inString = false;
let stringChar = '';
let inComment = false;
let inLineComment = false;

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  const nextC = code[i + 1];

  if (inString) {
    if (c === '\\') {
      i++; // skip escaped char
    } else if (c === stringChar) {
      inString = false;
    }
  } else if (inComment) {
    if (c === '*' && nextC === '/') {
      inComment = false;
      i++;
    }
  } else if (inLineComment) {
    if (c === '\n') {
      inLineComment = false;
    }
  } else {
    if (c === '/' && nextC === '*') {
      inComment = true;
      i++;
    } else if (c === '/' && nextC === '/') {
      inLineComment = true;
      i++;
    } else if (c === '"' || c === "'" || c === '\`') {
      inString = true;
      stringChar = c;
    } else if (c === '{') {
      braceCount++;
    } else if (c === '}') {
      braceCount--;
    } else if (c === '(') {
      parenCount++;
    } else if (c === ')') {
      parenCount--;
    }
  }
}

console.log(`Final counts -> Braces: ${braceCount}, Parens: ${parenCount}, inString: ${inString}, inComment: ${inComment}`);

if (inString) console.log("Left open string starting with: " + stringChar);
if (inComment) console.log("Left open block comment.");

