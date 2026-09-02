const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// In handleLogin (the patched version)
const loginSuccessRegex = /if \(typeof renderHome === 'function'\) renderHome\(\);\s*window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);/g;
const loginSuccessReplacement = `window.location.reload();`;
code = code.replace(loginSuccessRegex, loginSuccessReplacement);

// In handleRegister (the patched version I just created)
const registerSuccessRegex = /if \(typeof renderHome === 'function'\) renderHome\(\);\s*window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);/g;
code = code.replace(registerSuccessRegex, loginSuccessReplacement);

fs.writeFileSync('public/app.js', code);
console.log("Added window.location.reload() to auth success flows");
