with open('api/index.ts', 'r', encoding='utf-8') as f:
    text = f.read()

import re
print("--- Supplier routes in api/index.ts ---")
for line in text.split('\n'):
    if '/api/supplier' in line or 'test-connection' in line or 'fetch-products' in line:
        print(line)
