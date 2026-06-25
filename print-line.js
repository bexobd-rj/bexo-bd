import fs from 'fs';
const lines = fs.readFileSync('script.js', 'utf8').split('\n');
let s = '';
for(let i = 17405; i <= 17410; i++) {
  s += lines[i-1] + '\n';
}
console.log(JSON.stringify(s));
