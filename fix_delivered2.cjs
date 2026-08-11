const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/\(userProfile \? userProfile\.deliveredOrdersCount : 0\) = /g, "if(userProfile) userProfile.deliveredOrdersCount = ");

fs.writeFileSync('index.html', html);
console.log("Fixed all deliveredOrdersCount assignments");
