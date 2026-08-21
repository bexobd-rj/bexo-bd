const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
    'id="landingProductsContainer" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4"',
    'id="landingProductsContainer" class="grid grid-cols-3 min-[400px]:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 md:gap-3"'
);

fs.writeFileSync('index.html', html);
