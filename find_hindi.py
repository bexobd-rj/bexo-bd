import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

for i, line in enumerate(text.split('\n')):
    if re.search(r'[\u0900-\u097F]', line):
        print(f"{i+1}: {line.strip()}")
