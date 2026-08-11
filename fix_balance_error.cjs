const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const broken = `              function updateHeaderBalance() {
                  const headerBalance = document.getElementById('headerBalanceAmount');
                  if (headerBalance) {
                      const totalBalance = userProfile.rechargeBalance || 0;
                      headerBalance.innerText = totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2});
                  }
              }`;

const fixed = `              function updateHeaderBalance() {
                  const headerBalance = document.getElementById('headerBalanceAmount');
                  if (headerBalance) {
                      const totalBalance = userProfile && userProfile.rechargeBalance ? userProfile.rechargeBalance : 0;
                      headerBalance.innerText = totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2});
                  }
              }`;

html = html.replace(broken, fixed);
fs.writeFileSync('index.html', html);
console.log("Fixed userProfile.rechargeBalance null error");
