import re

with open('index.html', 'r') as f:
    html = f.read()

search_code = """} else if (action.action === 'SEARCH_TEXT') {
                if (typeof switchMenu === 'function') switchMenu('search');
                setTimeout(() => {
                    const searchInput = document.getElementById('searchQuery');
                    if (searchInput) {
                        searchInput.value = action.params.query;
                        // trigger input event to search
                        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }, 500);
            } else if (action.action === 'SEARCH_IMAGE') {"""

html = html.replace("} else if (action.action === 'SEARCH_IMAGE') {", search_code)

with open('index.html', 'w') as f:
    f.write(html)
