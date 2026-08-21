import re

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if any(k in line.lower() for k in ['stock', 'in stock', 'out of stock', 'stockstatus', 'স্টক']):
        print(f"index.html:{i+1}: {line.strip()[:100]}")

