const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regexOnload = /window\.addEventListener\('load', \(\) => \{[\s\S]*?renderHome\(\);/m;
const replacement = `window.addEventListener('load', () => {
                  const auth = document.getElementById('authSection');
                  const dash = document.getElementById('dashboardSection');
                  var landing = document.getElementById('landingSection');
                  
                  if (auth && dash) {
                      auth.classList.add('hidden');
                      dash.classList.remove('hidden');
                  }
                  if (landing) {
                      landing.classList.add('hidden');
                  }
                  renderHome();`;

html = html.replace(regexOnload, replacement);
fs.writeFileSync('index.html', html);
console.log("Updated onload");
