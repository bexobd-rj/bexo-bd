import fs from 'fs';

const content = fs.readFileSync('index.html', 'utf8');
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/g);
if (scriptMatch) {
  const lastScript = scriptMatch[scriptMatch.length - 1];
  const sContent = lastScript.replace(/<\/?script>/g, '');
  fs.writeFileSync('script.js', sContent);
  console.log("Script extracted to script.js");
}
