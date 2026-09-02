const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

code = code.replace(
    /alert\("Init failed: " \+ e\.message \+ " \| Stack: " \+ e\.stack\);/g,
    `console.error("Init failed: " + e.message + " | Stack: " + e.stack);`
);

fs.writeFileSync('public/app.js', code);
