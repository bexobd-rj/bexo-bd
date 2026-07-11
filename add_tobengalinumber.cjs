const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const toBengaliNumberFunc = `
              function toBengaliNumber(num) {
                  const bMap = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
                  return String(num).replace(/[0-9]/g, d => bMap[d] || d);
              }
`;

if (!html.includes('function toBengaliNumber')) {
    html = html.replace('function normalizePhone', toBengaliNumberFunc + '\\n              function normalizePhone');
}

fs.writeFileSync('index.html', html);
