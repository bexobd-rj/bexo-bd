import re

with open('index.html', 'r') as f:
    html = f.read()

# Fix the LOGOUT function call in AI UI
html = html.replace("if (typeof logoutUser === 'function') {\n                    logoutUser();", "if (typeof logout === 'function') {\n                    logout();")

# Write it back
with open('index.html', 'w') as f:
    f.write(html)
