const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace unprotected userProfile access with safe access
html = html.replace(/userProfile\.favorites/g, "(userProfile ? userProfile.favorites : [])");
html = html.replace(/userProfile\.deliveredOrdersCount/g, "(userProfile ? userProfile.deliveredOrdersCount : 0)");
html = html.replace(/userProfile\.isBanned/g, "(userProfile ? userProfile.isBanned : false)");

fs.writeFileSync('index.html', html);
console.log("Fixed userProfile accesses part 2");
