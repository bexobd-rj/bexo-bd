import re

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    line_num = idx + 1
    if 'stock' in line.lower() or 'স্টক' in line:
        # print concise snippet
        snippet = line.strip()
        if len(snippet) > 140:
            snippet = snippet[:140] + '...'
        print(f"Line {line_num}: {snippet}")
