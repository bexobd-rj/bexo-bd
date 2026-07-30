with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re

matches = re.findall(r'.{0,50}(?:Code|code|SKU|sku).{0,50}', content)
print(f"Total occurrences found: {len(matches)}")
for m in matches[:30]:
    print(m.strip())
