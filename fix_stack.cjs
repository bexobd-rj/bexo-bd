const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

code = code.replace(/window\.handleLogin = function\(e\) \{ window\._lastAuthError = null; handleLogin\(e\); \};/, 'window.handleLogin = handleLogin;');
code = code.replace(/async function handleLogin\(\) \{/, 'async function handleLogin() {\n                   window._lastAuthError = null;');

fs.writeFileSync('public/app.js', code);
console.log("Fixed call stack error");
