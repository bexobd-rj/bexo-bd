const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

// For window.addEventListener('load')
html = html.replace(
    "if (auth && dash) {\\n                          auth.classList.add('hidden');\\n                          dash.classList.remove('hidden');\\n                      }",
    "if (auth && dash) {\\n                          auth.classList.add('hidden');\\n                          dash.classList.remove('hidden');\\n                          const landing = document.getElementById('landingSection');\\n                          if(landing) landing.classList.add('hidden');\\n                      }"
);

// For handleRegister
html = html.replace(
    "if(auth && dash) {\\n                          auth.classList.add('hidden');\\n                          dash.classList.remove('hidden');\\n                          dash.classList.add('fade-in');",
    "if(auth && dash) {\\n                          auth.classList.add('hidden');\\n                          dash.classList.remove('hidden');\\n                          dash.classList.add('fade-in');\\n                          const landing = document.getElementById('landingSection');\\n                          if(landing) landing.classList.add('hidden');"
);

fs.writeFileSync('index.html', html);
console.log('Fixed landing hide');
