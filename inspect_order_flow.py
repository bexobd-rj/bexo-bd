with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find confirmOrderSubmit
idx = content.find('function confirmOrderSubmit(')
if idx != -1:
    print("--- confirmOrderSubmit ---")
    print(content[idx:idx+800])

# Find addToCart
idx2 = content.find('function addToCart(')
if idx2 != -1:
    print("--- addToCart ---")
    print(content[idx2:idx2+800])

