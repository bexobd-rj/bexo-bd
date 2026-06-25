import fs from 'fs';
const lines = fs.readFileSync('script.js', 'utf8').split('\n');
let openBraces = 0;
let started = false;
for(let i = 16809; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('function renderResellerSettlementModule')) started = true;
  if (started) {
    for (const char of line) {
      if (char === '{') openBraces++;
      if (char === '}') {
        openBraces--;
        if (openBraces === 0) {
           console.log("Ends at line " + (i+1));
           process.exit(0);
        }
      }
    }
  }
}
