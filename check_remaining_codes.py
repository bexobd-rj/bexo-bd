import re

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'code:' in l.lower() or 'sku:' in l.lower():
        print(f"Line {i+1}: {l.strip()[:140]}")
