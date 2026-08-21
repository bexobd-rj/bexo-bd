with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'sku' in l.lower() or 'productcode' in l.lower():
        if any(w in l.lower() for w in ['render', 'card', 'item', 'span', 'p', 'td', 'div']):
            print(f"Line {i+1}: {l.strip()[:140]}")
