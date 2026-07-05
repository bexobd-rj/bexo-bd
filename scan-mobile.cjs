const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regexes = [
  /class="[^"]*\b(w-(?:96|80|72|64|128|256|\[[^\]]+px\]))\b[^"]*"/g,
  /class="[^"]*\b(grid-cols-[2-9])\b[^"]*"/g,
  /class="[^"]*\b(px-(?:8|10|12|16))\b[^"]*"/g,
  /class="[^"]*\b(p-(?:8|10|12|16))\b[^"]*"/g,
];

let issues = {};
let total = 0;

regexes.forEach((regex, i) => {
  let match;
  while ((match = regex.exec(html)) !== null) {
    const cls = match[1];
    issues[cls] = (issues[cls] || 0) + 1;
    total++;
  }
});

console.log(`Found ${total} potential mobile issues.`);
const sorted = Object.entries(issues).sort((a,b) => b[1] - a[1]);
for (const [k, v] of sorted) {
    console.log(`${k}: ${v}`);
}
