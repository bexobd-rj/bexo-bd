import fs from 'fs';
let content = fs.readFileSync('index.html', 'utf8');

const regex = /\/\/ 2\. Build recent orders token helper list[\s\S]*?renderLoadedSettlementDetailsCard\(order\);\n\s*\}\n/g;

content = content.replace(regex, '');
fs.writeFileSync('index.html', content);
console.log("Removed duplicates 2");
