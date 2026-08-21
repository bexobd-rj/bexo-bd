with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'isstockout' in line.lower():
        print(f"Line {i+1}: {line.strip()[:130]}")
