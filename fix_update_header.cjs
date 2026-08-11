const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const updateHeaderUI = `
              function updateHeaderUI() {
                  // Stub function since we only have updateHeaderBalance now
              }
`;
html = html.replace('function updateHeaderBalance() {', updateHeaderUI + '\n              function updateHeaderBalance() {');

fs.writeFileSync('index.html', html);
console.log("Added updateHeaderUI");
