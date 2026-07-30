with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

target = "firebasePosts.push(data);"
replacement = """// Normalize stock status for real-time consistency across all clients
                          const numStock = (data.stockCount !== undefined && data.stockCount !== null) ? Number(data.stockCount) : ((data.stock !== undefined && data.stock !== null) ? Number(data.stock) : 0);
                          data.stockCount = numStock;
                          data.stock = numStock;
                          if (numStock > 0) {
                              data.isStockOut = false;
                              data.stockStatus = 'in_stock';
                          } else {
                              data.isStockOut = true;
                              data.stockStatus = 'out_of_stock';
                          }
                          firebasePosts.push(data);"""

content = content.replace(target, replacement, 1)

target2 = """if (firebasePosts.length > 0) {
                          appPosts = firebasePosts;
                          localStorage.setItem('bexo_posts', JSON.stringify(appPosts));
                          triggerViewRendering('posts');
                          if (typeof loadLandingProducts === 'function') {
                              loadLandingProducts();
                          }
                          if (typeof updateAdminStats === 'function') {
                              updateAdminStats();
                          }
                      }"""

replacement2 = """if (firebasePosts.length > 0) {
                          appPosts = firebasePosts;
                          localStorage.setItem('bexo_posts', JSON.stringify(appPosts));
                          triggerViewRendering('posts');
                          if (typeof renderPosts === 'function') {
                              renderPosts();
                          }
                          if (typeof loadLandingProducts === 'function') {
                              loadLandingProducts();
                          }
                          if (typeof updateAdminStats === 'function') {
                              updateAdminStats();
                          }
                      }"""

content = content.replace(target2, replacement2, 1)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated snapshot handler successfully!")
