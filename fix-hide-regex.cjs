const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

html = html.replace(/auth\.classList\.add\('hidden'\);\s*dash\.classList\.remove\('hidden'\);\s*}/g,
"auth.classList.add('hidden');\\n                          dash.classList.remove('hidden');\\n                          const landing = document.getElementById('landingSection');\\n                          if(landing) landing.classList.add('hidden');\\n                      }");

html = html.replace(/auth\.classList\.add\('hidden'\);\s*dash\.classList\.remove\('hidden'\);\s*dash\.classList\.add\('fade-in'\);\s*renderHome\(\);/g,
"auth.classList.add('hidden');\\n                          dash.classList.remove('hidden');\\n                          dash.classList.add('fade-in');\\n                          const landing = document.getElementById('landingSection');\\n                          if(landing) landing.classList.add('hidden');\\n                          renderHome();");

fs.writeFileSync('index.html', html.replace(/\\n/g, '\n'));
console.log('Fixed using regex');
