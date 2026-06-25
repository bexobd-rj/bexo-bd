import fs from 'fs';
const lines = fs.readFileSync('script.js', 'utf8').split('\n');
const line = lines[17408];
for(let i=0; i<line.length; i++) {
  console.log(line[i], line.charCodeAt(i).toString(16));
}
