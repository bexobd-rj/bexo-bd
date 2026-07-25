with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("--- Admin Menu matches ---")
for i, line in enumerate(lines):
    if any(k in line for k in ['bexo_admin_subview', 'renderAdmin', 'all-products', 'অর্ডার লিস্ট', 'গ্রাহক রিপোর্ট']):
        print(f"Line {i+1}: {line.strip()[:140]}")
