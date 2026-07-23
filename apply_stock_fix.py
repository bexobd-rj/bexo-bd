import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace/update window.isProductOutOfStock definition
old_is_out_of_stock = """window.isProductOutOfStock = function(p) {
    if (!p) return true;
    if (p.isStockOut === true) return true;
    if (p.stockCount !== undefined && p.stockCount !== null && p.stockCount <= 0) return true;
    if (p.stock !== undefined && p.stock !== null && p.stock <= 0) return true;
    if (p.stockStatus === 'out_of_stock') return true;
    return false;
};"""

new_is_out_of_stock = """window.isProductOutOfStock = function(p) {
    if (!p) return true;
    const numStock = (p.stockCount !== undefined && p.stockCount !== null) ? Number(p.stockCount) : ((p.stock !== undefined && p.stock !== null) ? Number(p.stock) : null);
    if (numStock !== null && numStock > 0) {
        p.isStockOut = false;
        p.stockStatus = 'in_stock';
        return false;
    }
    if (numStock !== null && numStock <= 0) {
        p.isStockOut = true;
        p.stockStatus = 'out_of_stock';
        return true;
    }
    if (p.isStockOut === true || p.stockStatus === 'out_of_stock') return true;
    return false;
};"""

if old_is_out_of_stock in content:
    content = content.replace(old_is_out_of_stock, new_is_out_of_stock)
    print("1. Replaced window.isProductOutOfStock")
else:
    print("1. Could not match old_is_out_of_stock exact string, checking...")

# 2. Update deductProductStock helper to ensure both stock and stockCount are synchronized
old_deduct = """window.deductProductStock = function(items) {
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
};"""

new_deduct = """window.deductProductStock = function(items) {
    if (!items || !Array.isArray(items)) return;
    let updated = false;
    items.forEach(item => {
        const pId = item.productId || item.id;
        const qty = item.qty || 1;
        const product = typeof appPosts !== 'undefined' ? appPosts.find(p => String(p.id) === String(pId) || (p.sku && item.sku && p.sku === item.sku) || p.title === item.title) : null;
        if (product) {
            const currentStock = (product.stockCount !== undefined && product.stockCount !== null) ? Number(product.stockCount) : ((product.stock !== undefined && product.stock !== null) ? Number(product.stock) : 100);
            const newStock = Math.max(0, currentStock - qty);
            product.stockCount = newStock;
            product.stock = newStock;
            if (newStock <= 0) {
                product.isStockOut = true;
                product.stockStatus = 'out_of_stock';
            } else {
                product.isStockOut = false;
                product.stockStatus = 'in_stock';
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
        if (typeof loadLandingProducts === 'function') loadLandingProducts();
        if (typeof renderPosts === 'function') renderPosts();
    }
};"""

if old_deduct in content:
    content = content.replace(old_deduct, new_deduct)
    print("2. Replaced deductProductStock")

# 3. Update appPosts initialization logic
old_app_posts = """let appPosts = JSON.parse(localStorage.getItem('bexo_posts')) || [];
appPosts.forEach(p => {
    if (p.stockCount !== undefined && p.stockCount !== null && p.stockCount <= 0) {
        p.isStockOut = true;
        p.stockStatus = 'out_of_stock';
    }
});"""

new_app_posts = """let appPosts = JSON.parse(localStorage.getItem('bexo_posts')) || [];
appPosts.forEach(p => {
    const s = (p.stockCount !== undefined && p.stockCount !== null) ? Number(p.stockCount) : ((p.stock !== undefined && p.stock !== null) ? Number(p.stock) : null);
    if (s !== null && s > 0) {
        p.isStockOut = false;
        p.stockStatus = 'in_stock';
        p.stockCount = s;
        p.stock = s;
    } else if (s !== null && s <= 0) {
        p.isStockOut = true;
        p.stockStatus = 'out_of_stock';
        p.stockCount = 0;
        p.stock = 0;
    }
});"""

if old_app_posts in content:
    content = content.replace(old_app_posts, new_app_posts)
    print("3. Replaced appPosts init logic")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

