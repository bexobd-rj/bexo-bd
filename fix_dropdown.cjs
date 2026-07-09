const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// fix user dropdown
html = html.replace(
    'class="hidden absolute right-0 mt-3 w-full max-w-[16rem] sm:w-64 bg-white',
    'class="hidden absolute right-0 mt-3 w-[240px] sm:w-64 bg-white'
);

// fix notification dropdown
html = html.replace(
    'class="hidden absolute right-0 mt-3 w-full max-w-xs sm:w-80 bg-white',
    'class="hidden absolute right-0 mt-3 w-[300px] sm:w-80 bg-white'
);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Success updating dropdown classes");
