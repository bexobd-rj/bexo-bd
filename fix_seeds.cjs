const fs = require('fs');
let content = fs.readFileSync('main_script.js', 'utf8');

// Replace settings auto-seed
content = content.replace(/window\.db\.collection\('bexo_settings'\)\.doc\('global'\)\.set\(sanitizeForFirestore\(appSettings\)\)\s*\.catch\(.*?\);/g, '// auto-seed settings disabled');

// Replace customer reports auto-seed
content = content.replace(/window\.db\.collection\('bexo_customer_reports'\)\.doc\('global'\)\.set\(sanitizeForFirestore\(appCustomerReports\)\)\s*\.catch\(.*?\);/g, '// auto-seed reports disabled');

fs.writeFileSync('main_script.js', content);
