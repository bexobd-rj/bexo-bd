with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'Code:' in l or 'code:' in l or 'SKU:' in l or 'sku:' in l or 'productId' in l:
        print(f"Line {i+1}: {l.strip()[:140]}")
