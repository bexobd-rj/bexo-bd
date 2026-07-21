import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

for i, line in enumerate(text.split('\n')):
    words = re.findall(r'[\u0900-\u097F]+', line)
    if words:
        print(f"Line {i+1}: {words}")
