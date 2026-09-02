const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

code = code.replace(
    /(\/\/ Passive Heartbeat for last active tracking)/,
    `initializeSupabaseIfReady();\n              $1`
);

fs.writeFileSync('public/app.js', code);
