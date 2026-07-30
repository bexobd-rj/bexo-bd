with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if any(k in line for k in ['apStockCount', 'apStockOut', 'stockCount:', 'isStockOut:', 'onSnapshot', 'firebasePosts']):
        print(f"Line {i+1}: {line.strip()[:140]}")
