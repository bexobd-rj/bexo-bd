const fs = require('fs');
let content = fs.readFileSync('main_script.js', 'utf8');

content = content.replace(/window\.db\.collection\('bexo_orders'\)\.doc\(String\(o\.id\)\)\.set\(sanitizeForFirestore\(o\)\)/g, '// disabled sweep order set');
content = content.replace(/window\.db\.collection\('bexo_transactions'\)\.doc\(String\(t\.id\)\)\.delete\(\)/g, '// disabled sweep transaction delete');

fs.writeFileSync('main_script.js', content);
