with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("--- Order details and invoice items in index.html ---")
for i, line in enumerate(lines):
    if any(k in line for k in ['invoiceItems', 'item.sku', 'item.code', 'productTitle', 'renderOrderDetail']):
        print(f"Line {i+1}: {line.strip()[:140]}")
