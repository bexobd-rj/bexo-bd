with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

target = """<input type="checkbox" id="apStockOut" class="sr-only peer" ${p && window.isProductOutOfStock(p) ? 'checked' : ''}>"""
replacement = """<input type="checkbox" id="apStockOut" onchange="if(this.checked){ document.getElementById('apStockCount').value = 0; document.getElementById('stockDisplayCounter').innerText = 0; document.getElementById('stockStatusText').innerText = 'স্টক নেই'; } else { const cur = parseInt(document.getElementById('apStockCount').value) || 0; const n = cur > 0 ? cur : 10; document.getElementById('apStockCount').value = n; document.getElementById('stockDisplayCounter').innerText = n; document.getElementById('stockStatusText').innerText = 'স্টক আছে'; }" class="sr-only peer" ${p && window.isProductOutOfStock(p) ? 'checked' : ''}>"""

if target in content:
    content = content.replace(target, replacement)
    print("Updated apStockOut onchange successfully!")
else:
    print("Target not found for apStockOut")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

