const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// Remove updateSupabaseConnectionBadges(false, ...) from error handlers
const regex1 = /updateSupabaseConnectionBadges\(false,\s*"Posts Sync Error: "\s*\+\s*err\.message\);/g;
code = code.replace(regex1, '// $&');

const regex2 = /updateSupabaseConnectionBadges\(false,\s*"Users Sync Error: "\s*\+\s*err\.message\);/g;
code = code.replace(regex2, '// $&');

const regex3 = /updateSupabaseConnectionBadges\(false,\s*"Orders Sync Error: "\s*\+\s*err\.message\);/g;
code = code.replace(regex3, '// $&');

const regex4 = /updateSupabaseConnectionBadges\(false,\s*"Settings Sync Error: "\s*\+\s*err\.message\);/g;
code = code.replace(regex4, '// $&');

fs.writeFileSync('public/app.js', code);
console.log("Fixed false offline indicators");
