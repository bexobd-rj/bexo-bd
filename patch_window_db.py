import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('''                  if (window.db) {
                      updateSupabaseConnectionBadges(true);
                      return true;
                  }''', '')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed window.db check")
