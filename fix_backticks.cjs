const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
    /copyToClipboard\(`\$\{p\.title\}\\\$\{p\.desc\}\\\$\{p\.details \|\| ''\}`\)/g,
    "copyToClipboard(\\`${p.title}\\n\\${p.desc}\\n\\${p.details || ''}\\`)"
);

fs.writeFileSync('index.html', html);
