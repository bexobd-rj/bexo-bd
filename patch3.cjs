const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// I also noticed in moveCategory we should also fix the UI update issue!
html = html.replace(
    /if \(currentMenu === 'admin'\) \{[\s\S]*?renderProductList\(\);\s*\}/g,
    `if (currentMenu === 'admin') {
                      const subView = localStorage.getItem('bexo_admin_subview') || document.querySelector('.admin-nav-item.active')?.getAttribute('data-view');
                      if (subView === 'all-products') renderAdminPostList();
                      else if (subView === 'categories') renderAdminCategoryList();
                      else renderProductList();
                  } else {
                      renderProductList();
                  }`
);

fs.writeFileSync('index.html', html);
