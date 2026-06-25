import fs from 'fs';
const lines = fs.readFileSync('script.js', 'utf8').split('\n');
fs.writeFileSync('test-chunk.js', lines.slice(17408, 17420).join('\n'));
console.log("Wrote test-chunk.js");
