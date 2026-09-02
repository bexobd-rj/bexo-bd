const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

code = code.replace(/type: 'magiclink'/g, "type: 'email'");

fs.writeFileSync('public/app.js', code);
