import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_tsx = f.read()

print("--- Searching index.html for stock logic ---")
for line_no, line in enumerate(html.splitlines(), 1):
    if any(w in line.lower() for w in ['stockcount', 'isstockout', 'stockstatus', 'togglestockstatus', 'stockisout']):
        print(f"index.html:{line_no}: {line.strip()[:120]}")

print("\n--- Searching src/App.tsx for stock logic ---")
for line_no, line in enumerate(app_tsx.splitlines(), 1):
    if any(w in line.lower() for w in ['stockcount', 'isstockout', 'stockstatus', 'togglestockstatus']):
        print(f"src/App.tsx:{line_no}: {line.strip()[:120]}")

