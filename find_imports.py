with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if any(k in l.lower() for k in ['import', 'bulk', 'csv', 'excel']):
        if any(w in l.lower() for w in ['post', 'product', 'upload', 'apbulk']):
            print(f"Line {i+1}: {l.strip()[:140]}")
