import fs from 'fs';
let content = fs.readFileSync('index.html', 'utf8');

const regex = /async function downloadAndShareInvoice\(event\) \{[\s\S]*?catch \(err\) \{[\s\S]*?\}[\s\S]*?\}/g;
const matches = [...content.matchAll(regex)];

if (matches.length > 1) {
  content = content.replace(matches[0][0], '');
  fs.writeFileSync('index.html', content);
  console.log("Removed first duplicate of downloadAndShareInvoice");
} else {
  console.log("Not enough matches found", matches.length);
}
