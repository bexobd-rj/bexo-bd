const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const sbRegex = /\/\/ Authenticate via Supabase Auth\s*if \(sb && sb\.auth && email && pass\) \{/m;

const sbReplacement = `// Authenticate via Supabase Auth
                      const sb = window.getSupabase ? window.getSupabase() : null;
                      if (sb && sb.auth && email && pass) {`;

if (sbRegex.test(code)) {
    code = code.replace(sbRegex, sbReplacement);
    fs.writeFileSync('public/app.js', code);
    console.log("Fixed sb in handleRegister");
} else {
    console.log("Could not find sb in handleRegister");
}
