const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /const requiredArrays = \['cart', 'orders', 'favorites', 'rechargeTransactions', 'passiveTransactions'\];[\s\S]*?ensureBexoPayFields\(\);/m;

const replacement = `const requiredArrays = ['cart', 'orders', 'favorites', 'rechargeTransactions', 'passiveTransactions'];
              if (userProfile) {
                  requiredArrays.forEach(arr => {
                      if (!userProfile[arr]) userProfile[arr] = [];
                  });
                  if (!userProfile.referrals) {
                      userProfile.referrals = { level1: [], level2: [], level3: [], level4: [] };
                  }
                  if (userProfile.deliveredOrdersCount === undefined) userProfile.deliveredOrdersCount = 0;
                  if (userProfile.passiveEarnings === undefined) userProfile.passiveEarnings = 0;
                  if (userProfile.rechargeBalance === undefined) userProfile.rechargeBalance = 0;
                  
                  function ensureBexoPayFields() {
                      const fields = {
                          rechargeBalance: 0,
                          totalRecharge: 0,
                          totalBillPay: 0,
                          totalCommission: 0,
                          rechargeTransactions: []
                      };
                      Object.keys(fields).forEach(key => {
                          if (userProfile[key] === undefined) {
                              userProfile[key] = fields[key];
                          }
                      });
                      saveProfile();
                  }
                  ensureBexoPayFields();
              }`;

if (regex.test(html)) {
    html = html.replace(regex, replacement);
    fs.writeFileSync('index.html', html);
    console.log("Fixed top-level userProfile null dereferences");
} else {
    console.log("Could not find block");
}

