with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("--- Cart additions in index.html ---")
for i, line in enumerate(lines):
    if any(k in line for k in ['cart.push', 'addToCart', 'userProfile.cart']):
        print(f"Line {i+1}: {line.strip()[:140]}")
