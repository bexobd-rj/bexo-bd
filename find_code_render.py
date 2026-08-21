with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("--- SKU / Code matches in index.html ---")
for i, line in enumerate(lines):
    if any(k in line for k in ['Code:', 'code:', 'SKU:', 'sku', 'apSku', 'renderOrderDetail']):
        print(f"Line {i+1}: {line.strip()[:140]}")
