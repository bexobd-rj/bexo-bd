const fs = require('fs');
let content = fs.readFileSync('main_script.js', 'utf8');

content = content.replace(/await window\.db\.collection\('bexo_users'\)\.doc\(String\(id\)\)\.set\(sanitizeForFirestore\(u\)\);/g, '// Disabled pending sync to save quota');

fs.writeFileSync('main_script.js', content);
