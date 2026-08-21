with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("--- Order creation in index.html ---")
for i, line in enumerate(lines):
    if any(k in line for k in ['appOrders.unshift', 'newOrder =', 'const order =']):
        print(f"Line {i+1}: {line.strip()[:140]}")
