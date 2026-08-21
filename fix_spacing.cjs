const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
    '<div class="flex items-center justify-center sm:justify-start w-full gap-3 pt-6 sm:pt-4">',
    '<div class="flex items-center justify-center sm:justify-start w-full gap-3 pt-4 sm:pt-3">'
);

fs.writeFileSync('index.html', html);
console.log("Fixed spacing");
