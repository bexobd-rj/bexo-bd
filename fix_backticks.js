const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The broken code for copyToClipboard
html = html.replace(
    /copyToClipboard\(`\$\{p\.title\}\\\$\{p\.desc\}\\\$\{p\.details \|\| ''\}`\)/g,
    "copyToClipboard(\\`${p.title}\\n\\${p.desc}\\n\\${p.details || ''}\\`)"
);

// We need to check if there are other unescaped backticks inside template literals.
// It might be hard. Let's see what other backticks exist.

fs.writeFileSync('index.html', html);
