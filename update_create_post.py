with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update isStockOut line in createPostFromAdmin
old_is_stock_out_line = "const isStockOut = document.getElementById('apStockOut').checked || stockCount <= 0;"
new_is_stock_out_line = """const apStockOutCheck = document.getElementById('apStockOut') ? document.getElementById('apStockOut').checked : false;
                  const isStockOut = stockCount <= 0;"""

content = content.replace(old_is_stock_out_line, new_is_stock_out_line, 1)

# 2. Add stock and stockStatus properties to bulk posts in newPosts
old_bulk_post = """stockCount: stockCount,
                              unitType: unitType,"""
new_bulk_post = """stockCount: stockCount,
                              stock: stockCount,
                              stockStatus: isStockOut ? 'out_of_stock' : 'in_stock',
                              unitType: unitType,"""

content = content.replace(old_bulk_post, new_bulk_post, 1)

# 3. Add stock and stockStatus properties to single post in newPosts
old_single_post = """stockCount: stockCount,
                          unitType: unitType,"""
new_single_post = """stockCount: stockCount,
                          stock: stockCount,
                          stockStatus: isStockOut ? 'out_of_stock' : 'in_stock',
                          unitType: unitType,"""

content = content.replace(old_single_post, new_single_post, 1)

# 4. Add changeStock helper function
change_stock_fn = """
function changeStock(id) {
    const p = appPosts.find(item => String(item.id) === String(id));
    if(!p) return;
    const currentStock = p.stockCount !== undefined ? p.stockCount : (p.stock !== undefined ? p.stock : 0);
    const newStockStr = prompt(`নতুন স্টক পরিমাণ লিখুন (${p.title}):`, currentStock);
    if(newStockStr !== null && !isNaN(newStockStr)) {
        const newStock = Math.max(0, parseInt(newStockStr));
        p.stockCount = newStock;
        p.stock = newStock;
        if (newStock > 0) {
            p.isStockOut = false;
            p.stockStatus = 'in_stock';
        } else {
            p.isStockOut = true;
            p.stockStatus = 'out_of_stock';
        }
        savePosts();
        if (window.db) {
            window.db.collection('bexo_posts').doc(String(id)).set(sanitizeForFirestore(p))
                .catch(err => console.error("Firebase update stock error:", err));
        }
        renderAdminPostList();
        if (typeof loadLandingProducts === 'function') loadLandingProducts();
        if (typeof renderPosts === 'function') renderPosts();
        if(typeof showSuccessOverlay === 'function') {
            showSuccessOverlay("স্টক আপডেট হয়েছে!", `নতুন স্টক: ${p.stockCount} Pcs`, "fas fa-boxes", "text-emerald-500", "bg-emerald-50");
        }
    }
}
"""

if "function changeStock(" not in content:
    content = content.replace("function changePrice(id) {", change_stock_fn + "\nfunction changePrice(id) {", 1)

# 5. Update renderAdminPostList table row to include clickable Stock quantity column or display
old_table_row_price = """<td class="px-4 sm:px-8 py-6">
                                                      <div onclick="changePrice(${p.id})" class="cursor-pointer group/price flex items-center gap-2 font-sans">
                                                          <p class="text-base font-black text-slate-900 tracking-tighter">৳${p.price}</p>
                                                          <i class="fas fa-edit text-slate-200 group-hover/price:text-orange-400 text-[10px] transition-all"></i>
                                                      </div>
                                                  </td>"""

new_table_row_price = """<td class="px-4 sm:px-8 py-6">
                                                      <div onclick="changePrice(${p.id})" class="cursor-pointer group/price flex items-center gap-2 font-sans mb-1">
                                                          <p class="text-base font-black text-slate-900 tracking-tighter">৳${p.price}</p>
                                                          <i class="fas fa-edit text-slate-200 group-hover/price:text-orange-400 text-[10px] transition-all"></i>
                                                      </div>
                                                      <div onclick="changeStock(${p.id})" class="cursor-pointer group/stock flex items-center gap-1.5 font-sans">
                                                          <span class="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md group-hover/stock:bg-orange-100 group-hover/stock:text-orange-600 transition-all">স্টক: ${p.stockCount !== undefined ? p.stockCount : (p.stock !== undefined ? p.stock : 0)} Pcs <i class="fas fa-edit text-[9px] ml-1"></i></span>
                                                      </div>
                                                  </td>"""

content = content.replace(old_table_row_price, new_table_row_price, 1)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated createPostFromAdmin & added changeStock successfully!")
