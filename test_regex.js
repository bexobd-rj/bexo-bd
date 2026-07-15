const fs = require('fs');
const html = fs.readFileSync('check.html', 'utf8');
const matches = html.match(/if \(currentMenu === 'admin'\) \{[\s\S]*?renderProductList\(\);\s*\}/g);
console.log(matches ? matches.length : 0);
if (matches) {
    matches.forEach((m, i) => {
        console.log(`Match ${i} length: ${m.length}`);
    });
}
