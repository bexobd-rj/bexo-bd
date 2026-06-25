import fs from 'fs';
let content = fs.readFileSync('index.html', 'utf8');

const regex = /\n\s*\)\.join\(''\);\n\n\s*const mobileTxEmpty = `[\s\S]*?renderBalanceStatement\(\) \{/g;
const replaceString = '\n               function renderBalanceStatement() {';

content = content.replace(regex, replaceString);
fs.writeFileSync('index.html', content);
console.log("Fixed broken leftover");
