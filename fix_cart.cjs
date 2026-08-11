const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const broken = `              function updateCartCount() {
                  const count = (userProfile.cart || []).length;`;

const fixed = `              function updateCartCount() {
                  const count = userProfile && userProfile.cart ? userProfile.cart.length : 0;`;

html = html.replace(broken, fixed);
fs.writeFileSync('index.html', html);
console.log("Fixed cart error");
