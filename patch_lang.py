import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

toggle_lang_script = """              // Prevent standard circular reference crashes on JSON.stringify across the entire app
              window.currentLang = 'EN';
              window.toggleLanguage = function(e) {
                  e.preventDefault();
                  window.currentLang = window.currentLang === 'EN' ? 'BN' : 'EN';
                  document.querySelectorAll('.globalLangLabel').forEach(el => el.innerText = window.currentLang);
                  showToast("Language changed to " + window.currentLang, "info");
              };"""

content = content.replace('              // Prevent standard circular reference crashes on JSON.stringify across the entire app', toggle_lang_script)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added toggleLanguage")
