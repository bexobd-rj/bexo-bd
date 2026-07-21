import re
import os
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                text = f.read()
            for i, line in enumerate(text.split('\n')):
                words = re.findall(r'[\u0900-\u0963\u0966-\u097F]+', line)
                if words:
                    print(f"{file}:{i+1}: {words}")
