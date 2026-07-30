const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// Replace registerForm HTML
const registerFormRegex = /<div id="registerForm" class="fade-in">[\s\S]*?<form\s+onsubmit="\s*event\.preventDefault\(\);\s*handleRegister\(\);\s*"[\s\S]*?<\/form>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

// Wait, the regex might be brittle. Let's just use string replacement for the form part.
