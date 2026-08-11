const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/\(userProfile \? userProfile\.deliveredOrdersCount : 0\) = Number\(globalUser\.deliveredOrdersCount\) \|\| 0;/g, "if(userProfile) { userProfile.deliveredOrdersCount = Number(globalUser.deliveredOrdersCount) || 0; }");

fs.writeFileSync('index.html', html);
console.log("Fixed deliveredOrdersCount assignment");
