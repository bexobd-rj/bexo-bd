const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The string was: let matchedUser = null; [NEWLINE]                    try {
html = html.replace(/let matchedUser = null;\s*try {/g, 'try {');
fs.writeFileSync('index.html', html);
