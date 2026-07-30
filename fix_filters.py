with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("if (p.isStockOut === true) return false;", "if (window.isProductOutOfStock(p)) return false;")
content = content.replace("if (p.isPublished === false || p.isStockOut === true) return false;", "if (p.isPublished === false || window.isProductOutOfStock(p)) return false;")
content = content.replace("&& p.isStockOut !== true", "&& !window.isProductOutOfStock(p)")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Filters updated successfully!")
