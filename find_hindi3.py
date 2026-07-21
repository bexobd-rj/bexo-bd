import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

for i, line in enumerate(text.split('\n')):
    for char in line:
        if '\u0900' <= char <= '\u097F':
            print(f"{i+1}: {line.strip()}")
            break
