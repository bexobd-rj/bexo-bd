import re
import os
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                text = f.read()
            for i, line in enumerate(text.split('\n')):
                for char in line:
                    if '\u0900' <= char <= '\u097F':
                        print(f"{file}:{i+1}: {line.strip()}")
                        break
