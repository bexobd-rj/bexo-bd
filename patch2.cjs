const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
    /const subView = document\.querySelector\('\.admin-nav-item\.active'\)\?\.getAttribute\('data-view'\);/g,
    `const subView = localStorage.getItem('bexo_admin_subview') || document.querySelector('.admin-nav-item.active')?.getAttribute('data-view');`
);

fs.writeFileSync('index.html', html);
