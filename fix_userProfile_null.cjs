const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/const cartItems = userProfile\.cart \|\| \[\];/g, "const cartItems = userProfile && userProfile.cart ? userProfile.cart : [];");
html = html.replace(/userProfile\.cart\.reduce/g, "(userProfile && userProfile.cart ? userProfile.cart : []).reduce");
html = html.replace(/userProfile\.cart\.filter/g, "(userProfile && userProfile.cart ? userProfile.cart : []).filter");
html = html.replace(/\.\.\.userProfile\.cart/g, "...(userProfile && userProfile.cart ? userProfile.cart : [])");
html = html.replace(/if \(userProfile\.cart\.length === 0\)/g, "if ((userProfile && userProfile.cart ? userProfile.cart : []).length === 0)");

fs.writeFileSync('index.html', html);
console.log("Fixed userProfile accesses");
