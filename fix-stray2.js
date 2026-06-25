import fs from 'fs';
let content = fs.readFileSync('index.html', 'utf8');

const regex = /\}\s*;\s*\n\s*\}\s*\n\s*function verifySuperAdminPin\(\) \{/g;
content = content.replace(regex, '};\n\n               function verifySuperAdminPin() {');

fs.writeFileSync('index.html', content);
console.log("Fixed stray brace before verifySuperAdminPin");
