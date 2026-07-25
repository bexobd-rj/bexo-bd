with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add getProductCode and checkSkuDuplicateLive helper functions
helpers = """
function getProductCode(item) {
    if (!item) return 'N/A';
    if (typeof item === 'string') return item;
    
    // Direct sku / code property
    if (item.sku && String(item.sku).trim() !== '' && String(item.sku).trim().toUpperCase() !== 'N/A') {
        return String(item.sku).trim();
    }
    if (item.code && String(item.code).trim() !== '' && String(item.code).trim().toUpperCase() !== 'N/A') {
        return String(item.code).trim();
    }
    
    // Match with global appPosts
    const pId = item.productId || item.id;
    if (typeof appPosts !== 'undefined' && Array.isArray(appPosts) && appPosts.length > 0) {
        const p = appPosts.find(post => 
            (pId && String(post.id) === String(pId)) || 
            (item.title && post.title === item.title) ||
            (item.productTitle && post.title === item.productTitle)
        );
        if (p && p.sku && String(p.sku).trim() !== '') {
            return String(p.sku).trim();
        }
    }
    
    // Fallback if item.productId is a short custom code
    if (item.productId && String(item.productId).length < 10 && !isNaN(item.productId)) {
        return String(item.productId);
    }
    
    return 'N/A';
}
window.getProductCode = getProductCode;

function checkSkuDuplicateLive(val, pId) {
    const skuDisplay = document.getElementById('skuDisplay');
    if (skuDisplay) skuDisplay.innerText = (val || 'SKU-XXXXXX').toUpperCase();
    
    const warningEl = document.getElementById('skuDuplicateWarning');
    const inputEl = document.getElementById('apSku');
    if (!val || !val.trim()) {
        if (warningEl) warningEl.classList.add('hidden');
        if (inputEl) inputEl.classList.remove('border-red-500', 'bg-red-50');
        return;
    }
    const cleanVal = val.trim().toLowerCase();
    const isDup = (typeof appPosts !== 'undefined' ? appPosts : []).some(item => {
        if (pId && String(pId) !== 'null' && String(pId) !== '' && String(item.id) === String(pId)) return false;
        return item.sku && String(item.sku).trim().toLowerCase() === cleanVal;
    });
    if (isDup) {
        if (warningEl) warningEl.classList.remove('hidden');
        if (inputEl) inputEl.classList.add('border-red-500', 'bg-red-50');
    } else {
        if (warningEl) warningEl.classList.add('hidden');
        if (inputEl) inputEl.classList.remove('border-red-500', 'bg-red-50');
    }
}
window.checkSkuDuplicateLive = checkSkuDuplicateLive;
"""

if "function getProductCode(" not in content:
    content = content.replace("function changeStock(", helpers + "\nfunction changeStock(", 1)
    print("Added getProductCode & checkSkuDuplicateLive helpers.")

# 2. Update renderOrderDetail Code display line
old_order_detail_code = '<div class="text-xs text-gray-400">Code: ${item.productId || \'N/A\'}</div>'
new_order_detail_code = '<div class="text-xs text-slate-500 font-semibold">Code: ${getProductCode(item)}</div>'
if old_order_detail_code in content:
    content = content.replace(old_order_detail_code, new_order_detail_code)
    print("Updated renderOrderDetail code line.")

# 3. Update order success modal random code line
old_modal_random_code = '<p class="font-black text-slate-400 uppercase text-[9px] tracking-widest">Code: ${Math.floor(Math.random() * 900000) + 100000}</p>'
new_modal_random_code = '<p class="font-black text-slate-400 uppercase text-[9px] tracking-widest">Code: ${getProductCode(item)}</p>'
if old_modal_random_code in content:
    content = content.replace(old_modal_random_code, new_modal_random_code)
    print("Updated order success modal code line.")

# 4. Update admin order breakdown table row
old_admin_order_code = '<span class="font-black text-slate-700 text-[10px]">#${28000 + (it.productId || 0)}</span>'
new_admin_order_code = '<span class="font-black text-slate-700 text-[10px]">Code: ${getProductCode(it)}</span>'
if old_admin_order_code in content:
    content = content.replace(old_admin_order_code, new_admin_order_code)
    print("Updated admin order breakdown table code line.")

# 5. Update apSku input HTML with live check in renderNewPost
old_ap_sku_input = '<input type="text" id="apSku" value="${p ? p.sku : \'\'}" oninput="document.getElementById(\'skuDisplay\').innerText = (this.value || \'SKU-XXXXXX\').toUpperCase()" class="px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 font-black text-sm text-right w-full sm:w-48" placeholder="SKU-XXX">'
new_ap_sku_input = """<div class="flex flex-col items-end w-full sm:w-auto">
    <input type="text" id="apSku" value="${p ? p.sku : ''}" oninput="checkSkuDuplicateLive(this.value, '${pId || ''}')" class="px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 font-black text-sm text-right w-full sm:w-48 transition-all" placeholder="SKU-XXX">
    <p id="skuDuplicateWarning" class="text-[10px] font-bold text-red-500 mt-1 hidden"><i class="fas fa-exclamation-triangle mr-1"></i> এই প্রোডাক্ট কোডটি ইতোমধ্যে ব্যবহৃত হয়েছে!</p>
</div>"""
if old_ap_sku_input in content:
    content = content.replace(old_ap_sku_input, new_ap_sku_input)
    print("Updated apSku input field in form.")

# 6. Add duplicate SKU check at top of createPostFromAdmin
old_create_post_start = "const sku = document.getElementById('apSku').value.trim() || `SKU-${Date.now().toString().slice(-6)}`;"
new_create_post_start = """const rawSku = document.getElementById('apSku').value.trim();
                  const sku = rawSku || `SKU-${Date.now().toString().slice(-6)}`;
                  
                  // Check for duplicate SKU
                  const duplicatePost = (typeof appPosts !== 'undefined' ? appPosts : []).find(item => {
                      if (pId && String(pId) !== 'null' && String(pId) !== '' && String(item.id) === String(pId)) return false;
                      return item.sku && String(item.sku).trim().toLowerCase() === sku.toLowerCase();
                  });
                  if (duplicatePost) {
                      showToast(`এই প্রোডাক্ট কোড/SKU (${sku}) টি ইতোমধ্যে অন্য একটি প্রোডাক্টে ("${duplicatePost.title}") ব্যবহৃত হয়েছে!`, 'error');
                      if (typeof showSuccessOverlay === 'function') {
                          showSuccessOverlay("ডুপ্লিকেট প্রোডাক্ট কোড!", `SKU: ${sku} টি ইতোমধ্যে ব্যবহৃত হয়েছে`, "fas fa-exclamation-triangle", "text-red-500", "bg-red-50");
                      }
                      const inputEl = document.getElementById('apSku');
                      if (inputEl) {
                          inputEl.focus();
                          inputEl.classList.add('border-red-500', 'bg-red-50');
                      }
                      return;
                  }"""

if old_create_post_start in content:
    content = content.replace(old_create_post_start, new_create_post_start, 1)
    print("Updated createPostFromAdmin with strict duplicate SKU check.")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("All SKU fixes applied successfully!")
