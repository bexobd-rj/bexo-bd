with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

target = """                      if (type === 'posts') {
                          if (currentMenu === 'products') {
                              renderProductList();
                          } else if (currentMenu === 'dashboard') {
                              renderHome();
                          } else if (currentMenu === 'new-post') {
                              renderNewPost();
                          } else if (currentMenu === 'admin') {
                              const subView = localStorage.getItem('bexo_admin_subview') || 'dashboard';
                              if (subView === 'all-products' && typeof renderAdminPostList === 'function') {
                                  renderAdminPostList();
                              }
                          }
                      }"""

replacement = """                      if (type === 'posts') {
                          if (typeof renderPosts === 'function') renderPosts();
                          if (typeof loadLandingProducts === 'function') loadLandingProducts();
                          if (currentMenu === 'products' && typeof renderProductList === 'function') {
                              renderProductList();
                          } else if (currentMenu === 'dashboard' && typeof renderHome === 'function') {
                              renderHome();
                          } else if (currentMenu === 'admin') {
                              const subView = localStorage.getItem('bexo_admin_subview') || 'dashboard';
                              if ((subView === 'all-products' || subView === 'stock-out') && typeof renderAdminPostList === 'function') {
                                  renderAdminPostList();
                              }
                          }
                      }"""

if target in content:
    content = content.replace(target, replacement)
    print("Updated triggerViewRendering successfully!")
else:
    print("Could not find trigger target string")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

