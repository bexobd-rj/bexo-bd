const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const regex = /if \(key === 'password'\) \{[\s\S]*?continue;\s*\}/;
const replacement = `if (key === 'password' || key === 'enc_password') { continue; }`;
code = code.replace(regex, replacement);

fs.writeFileSync('public/app.js', code);
