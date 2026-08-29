const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// Fix 1: handleRegister -> add password: pass
code = code.replace(/enc_password: btoa\(unescape\(encodeURIComponent\(pass\)\)\),/, `password: pass,
                          enc_password: btoa(unescape(encodeURIComponent(pass))),`);

// Fix 2: handleLogin -> fallback check
const fallbackRegex = /if \(!window\.supabase && matchedUser && matchedUser\.password\) \{/;
code = code.replace(fallbackRegex, `if (matchedUser && matchedUser.password) {`);

fs.writeFileSync('public/app.js', code);
console.log("Success: Patched login and register");
