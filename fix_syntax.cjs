const fs = require('fs');
let content = fs.readFileSync('main_script.js', 'utf8');

content = content.replace(/\/\/ disabled sweep transaction delete\s*\.catch\(/g, '// disabled sweep transaction delete \n// .catch(');
content = content.replace(/\/\/ disabled sweep order set\s*\.catch\(/g, '// disabled sweep order set \n// .catch(');

fs.writeFileSync('main_script.js', content);
