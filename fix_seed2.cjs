const fs = require('fs');
let content = fs.readFileSync('main_script.js', 'utf8');

const regex = /\}\s*else\s*if\s*\([a-zA-Z0-9_]+\.length\s*>\s*0\)\s*\{\s*[a-zA-Z0-9_]+\.forEach\([a-zA-Z0-9_]+\s*=>\s*\{\s*window\.db\.collection\('[a-zA-Z0-9_]+'\)\.doc\(String\([a-zA-Z0-9_]+\.(id|profileId)\)\)\.set\(sanitizeForFirestore\([a-zA-Z0-9_]+\)\)\s*\.catch\(err => console\.error\(.*?\)\);\s*\}\);\s*\}/g;

content = content.replace(regex, '} else { /* Auto-seed disabled to save quota */ }');

fs.writeFileSync('main_script.js', content);
