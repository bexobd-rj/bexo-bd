import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/\\\`<span /g, '\`<span ');
html = html.replace(/<\/span>\\\`/g, '</span>\`');
html = html.replace(/\\\$\{advanceVal\}/g, '\${advanceVal}');

fs.writeFileSync('index.html', html);
console.log("Fixed backticks.");
