import re

with open('index.html', 'r') as f:
    html = f.read()

search_code = """} else if (action.action === 'SEARCH_ORDER') {
                if (typeof switchMenu === 'function') switchMenu('orders');
                setTimeout(() => {
                    const searchInput = document.getElementById('orderSearchInput');
                    if (searchInput) {
                        searchInput.value = action.params.query;
                        if (typeof searchOrders === 'function') searchOrders();
                        else searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }, 500);
            } else if (action.action === 'SEARCH_TEXT') {"""

html = html.replace("} else if (action.action === 'SEARCH_TEXT') {", search_code)

with open('index.html', 'w') as f:
    f.write(html)
