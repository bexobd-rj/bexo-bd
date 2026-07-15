const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// I will fix the indentation and brackets manually
html = html.replace(
    /\} else if \(currentMenu === 'admin'\) \{\s*const subView = localStorage\.getItem\('bexo_admin_subview'\) \|\| document\.querySelector\('\.admin-nav-item\.active'\)\?\.getAttribute\('data-view'\);\s*if \(subView === 'all-products'\) renderAdminPostList\(\);\s*else if \(subView === 'categories'\) renderAdminCategoryList\(\);\s*else renderProductList\(\);\s*\} else \{\s*renderProductList\(\);\s*\}/,
    `} else if (currentMenu === 'admin') {
                              const subView = localStorage.getItem('bexo_admin_subview') || document.querySelector('.admin-nav-item.active')?.getAttribute('data-view');
                              if (subView === 'all-products') renderAdminPostList();
                              else if (subView === 'categories') renderAdminCategoryList();
                              else renderProductList();
                          }`
);

fs.writeFileSync('index.html', html);
