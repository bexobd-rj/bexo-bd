import re
import os

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or 'dist' in root:
        continue
    for file in files:
        if file.endswith(('.html', '.js', '.ts', '.tsx', '.jsx', '.cjs')):
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                try:
                    text = f.read()
                except UnicodeDecodeError:
                    continue
            for i, line in enumerate(text.split('\n')):
                words = re.findall(r'[\u0900-\u0963\u0966-\u097F]+', line)
                if words:
                    print(f"{file}:{i+1}: {words}")
