const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// In renderProductList
html = html.replace(
    'class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3"',
    'class="grid grid-cols-3 min-[400px]:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 md:gap-3"'
);

// In renderFilteredProductList
html = html.replace(
    '<div id="productGrid" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 lg:gap-3">',
    '<div id="productGrid" class="grid grid-cols-3 min-[400px]:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 md:gap-3">'
);

fs.writeFileSync('index.html', html);
