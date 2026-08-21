import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's search for any place displaying 'sku' or 'code' or 'productid' in template literals
matches = re.findall(r'<[^>]*>(?:Code|SKU|sku|code)[^<]*<[^>]*>', content, re.IGNORECASE)
for m in set(matches):
    print(m.strip())
