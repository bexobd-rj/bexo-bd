import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Define window.isProductOutOfStock and window.deductProductStock globally near savePosts / helper functions
helper_js = """
window.isProductOutOfStock = function(p) {
    if (!p) return true;
    if (p.isStockOut === true) return true;
    if (p.stockCount !== undefined && p.stockCount !== null && p.stockCount <= 0) return true;
    if (p.stock !== undefined && p.stock !== null && p.stock <= 0) return true;
    if (p.stockStatus === 'out_of_stock') return true;
    return false;
};

window.deductProductStock = function(items) {
    if (!items || !Array.isArray(items)) return;
    let updated = false;
    items.forEach(item => {
        const pId = item.productId || item.id;
        const qty = item.qty || 1;
        const product = typeof appPosts !== 'undefined' ? appPosts.find(p => String(p.id) === String(pId) || (p.sku && item.sku && p.sku === item.sku) || p.title === item.title) : null;
        if (product) {
            const currentStock = (product.stockCount !== undefined && product.stockCount !== null) ? product.stockCount : (product.stock !== undefined ? product.stock : 100);
            const newStock = Math.max(0, currentStock - qty);
            product.stockCount = newStock;
            product.stock = newStock;
            if (newStock <= 0) {
                product.isStockOut = true;
                product.stockStatus = 'out_of_stock';
            }
            updated = true;
            if (window.db) {
                window.db.collection('bexo_posts').doc(String(product.id)).set(sanitizeForFirestore(product))
                    .catch(err => console.error("Firebase update stock error:", err));
            }
        }
    });
    if (updated && typeof savePosts === 'function') {
        savePosts();
        if (typeof renderAdminPostList === 'function' && document.getElementById('adminViewContainer')) {
            renderAdminPostList();
        }
        if (typeof loadLandingProducts === 'function') {
            loadLandingProducts();
        }
    }
};
"""

if 'window.isProductOutOfStock =' not in content:
    content = content.replace("function savePosts() {", helper_js + "\nfunction savePosts() {", 1)

# 2. Sanitize loaded appPosts so any product with stockCount <= 0 gets isStockOut: true
old_app_posts_init = "let appPosts = JSON.parse(localStorage.getItem('bexo_posts')) || [];"
new_app_posts_init = """let appPosts = JSON.parse(localStorage.getItem('bexo_posts')) || [];
appPosts.forEach(p => {
    if (p.stockCount !== undefined && p.stockCount !== null && p.stockCount <= 0) {
        p.isStockOut = true;
        p.stockStatus = 'out_of_stock';
    }
});"""
content = content.replace(old_app_posts_init, new_app_posts_init, 1)

# 3. Update toggleStockStatus function
old_toggle_stock = """function toggleStockStatus(id) {
                  const p = appPosts.find(item => String(item.id) === String(id));
                  if(p) {
                      p.isStockOut = !p.isStockOut;
                      savePosts();
                      if (window.db) {
                          window.db.collection('bexo_posts').doc(String(id)).set(sanitizeForFirestore(p))
                              .catch(err => console.error("Firebase update product error:", err));
                      }
                      renderAdminPostList();
                  }
              }"""

new_toggle_stock = """function toggleStockStatus(id) {
                  const p = appPosts.find(item => String(item.id) === String(id));
                  if(p) {
                      const isCurrentlyOut = window.isProductOutOfStock(p);
                      if (isCurrentlyOut) {
                          p.isStockOut = false;
                          p.stockStatus = 'in_stock';
                          p.stockCount = (p.stockCount && p.stockCount > 0) ? p.stockCount : 10;
                          p.stock = p.stockCount;
                      } else {
                          p.isStockOut = true;
                          p.stockStatus = 'out_of_stock';
                          p.stockCount = 0;
                          p.stock = 0;
                      }
                      savePosts();
                      if (window.db) {
                          window.db.collection('bexo_posts').doc(String(id)).set(sanitizeForFirestore(p))
                              .catch(err => console.error("Firebase update product error:", err));
                      }
                      renderAdminPostList();
                  }
              }"""

content = content.replace(old_toggle_stock, new_toggle_stock, 1)

# 4. Update renderAdminPostList status button rendering
old_admin_btn = """<button onclick="toggleStockStatus(${p.id})" class="px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all ${!p.isStockOut ? 'bg-emerald-50 text-emerald-600 hover:bg-rose-50 hover:text-rose-600' : 'bg-rose-50 text-rose-600 hover:bg-emerald-50 hover:text-emerald-600'}">
                                                              ${!p.isStockOut ? 'In Stock' : 'Stock Out'}
                                                          </button>"""

new_admin_btn = """<button onclick="toggleStockStatus(${p.id})" class="px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all ${!window.isProductOutOfStock(p) ? 'bg-emerald-50 text-emerald-600 hover:bg-rose-50 hover:text-rose-600' : 'bg-rose-50 text-rose-600 hover:bg-emerald-50 hover:text-emerald-600'}">
                                                              ${!window.isProductOutOfStock(p) ? 'In Stock' : 'Stock Out'}
                                                          </button>"""

content = content.replace(old_admin_btn, new_admin_btn, 1)

# 5. Update renderAdminNewPostForm checkbox & inputs
old_ap_stock_checkbox = """<input type="checkbox" id="apStockOut" class="sr-only peer" ${p && p.isStockOut ? 'checked' : ''}>"""
new_ap_stock_checkbox = """<input type="checkbox" id="apStockOut" class="sr-only peer" ${p && window.isProductOutOfStock(p) ? 'checked' : ''}>"""
content = content.replace(old_ap_stock_checkbox, new_ap_stock_checkbox, 1)

old_stock_status_text = """<span id="stockStatusText">${p && p.stockCount > 0 ? 'স্টক আছে' : 'স্টক নেই'}</span>"""
new_stock_status_text = """<span id="stockStatusText">${p && !window.isProductOutOfStock(p) ? 'স্টক আছে' : 'স্টক নেই'}</span>"""
content = content.replace(old_stock_status_text, new_stock_status_text, 1)

old_ap_stock_input = """<input type="number" id="apStockCount" value="${p ? p.stockCount : 0}" min="0" oninput="document.getElementById('stockDisplayCounter').innerText = this.value || 0; document.getElementById('stockStatusText').innerText = (this.value > 0 ? 'স্টক আছে' : 'স্টক নেই');" class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 font-bold text-sm">"""
new_ap_stock_input = """<input type="number" id="apStockCount" value="${p ? (p.stockCount !== undefined ? p.stockCount : (p.stock !== undefined ? p.stock : 0)) : 0}" min="0" oninput="const v = parseInt(this.value) || 0; document.getElementById('stockDisplayCounter').innerText = v; document.getElementById('stockStatusText').innerText = (v > 0 ? 'স্টক আছে' : 'স্টক নেই'); const chk = document.getElementById('apStockOut'); if (chk) chk.checked = (v <= 0);" class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 font-bold text-sm">"""
content = content.replace(old_ap_stock_input, new_ap_stock_input, 1)

# 6. Update savePost logic
old_save_is_stock_out = "const isStockOut = document.getElementById('apStockOut').checked;"
new_save_is_stock_out = "const isStockOut = document.getElementById('apStockOut').checked || stockCount <= 0;"
content = content.replace(old_save_is_stock_out, new_save_is_stock_out, 1)

# 7. Add deductProductStock calls on order placement
old_confirm_order_save = """appOrders.unshift(order);
                  saveOrders();"""
new_confirm_order_save = """appOrders.unshift(order);
                  if (typeof window.deductProductStock === 'function') window.deductProductStock(order.items);
                  saveOrders();"""
content = content.replace(old_confirm_order_save, new_confirm_order_save, 1)

old_single_order_save = """appOrders.unshift(newOrder);
                  saveOrders();"""
new_single_order_save = """appOrders.unshift(newOrder);
                  if (typeof window.deductProductStock === 'function') window.deductProductStock(newOrder.items);
                  saveOrders();"""
content = content.replace(old_single_order_save, new_single_order_save, 1)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated index.html successfully!")
