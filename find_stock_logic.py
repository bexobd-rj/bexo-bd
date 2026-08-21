import re

with open('index.html', 'r', encoding='utf-8') as f:
    html_lines = f.readlines()

print("--- INDEX.HTML STOCK MATCHES ---")
for i, line in enumerate(html_lines):
    if any(k in line for k in ['isStockOut', 'stockCount', 'toggleStockStatus', 'apStockOut', 'apStockCount', 'stockDisplayCounter']):
        print(f"Line {i+1}: {line.strip()[:120]}")

