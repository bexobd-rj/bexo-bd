import re

with open('index.html', 'r') as f:
    html = f.read()

withdraw_code = """} else if (action.action === 'WITHDRAW') {
                if (typeof switchMenu === 'function') switchMenu('balance');
                setTimeout(() => {
                    const amountInput = document.getElementById('withdrawAmount');
                    if (amountInput) amountInput.value = action.params.amount;
                    if (typeof submitWithdrawRequest === 'function') {
                        submitWithdrawRequest();
                    }
                }, 500);
            } else if (action.action === 'SEARCH_IMAGE') {"""

html = html.replace("} else if (action.action === 'SEARCH_IMAGE') {", withdraw_code)

with open('index.html', 'w') as f:
    f.write(html)
