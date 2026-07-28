import re

with open('index.html', 'r') as f:
    html = f.read()

# Fix escaping
html = html.replace("\\`", "`")
html = html.replace("\\${", "${")
html = html.replace("\\\\n", "\\n")

with open('index.html', 'w') as f:
    f.write(html)
