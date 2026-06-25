import fs from 'fs';

const content = fs.readFileSync('script.js', 'utf8');

const regex = /function\s+([a-zA-Z0-9_]+)\s*\(/g;
let match;
const found = {};
let duplicates = [];

while ((match = regex.exec(content)) !== null) {
  const name = match[1];
  if (found[name]) {
    duplicates.push(name);
  }
  found[name] = true;
}

console.log("Duplicates: " + Array.from(new Set(duplicates)).join(", "));
