import fs from 'fs';
let content = fs.readFileSync('index.html', 'utf8');

const regex = /function renderBalanceStatement\(\) \{[\s\S]*?`\s*;\s*\}/g;
const matches = [...content.matchAll(regex)];

if (matches.length > 1) {
  // Remove the first occurrence
  content = content.replace(matches[0][0], '');
  fs.writeFileSync('index.html', content);
  console.log("Removed first duplicate of renderBalanceStatement");
} else {
  console.log("Not enough matches found");
}
