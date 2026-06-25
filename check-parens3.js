import fs from 'fs';
const content = fs.readFileSync('script.js', 'utf8');

const lines = content.split('\n');

let p = 0;
for (let i = 17280; i <= 17407; i++) {
  const line = lines[i];
  for(const c of line) {
    if (c === '(') p++;
    if (c === ')') p--;
  }
}
console.log("Parens in getTabListHTML: " + p);
