const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

html = html.replace(
    "auth.classList.add('hidden');\\n                          dash.classList.remove('hidden');",
    "auth.classList.add('hidden');\\n                          dash.classList.remove('hidden');\\n                          const landing = document.getElementById('landingSection');\\n                          if(landing) landing.classList.add('hidden');"
);

// Also let's check the direct login switch at 4805
html = html.replace(
    "auth.classList.add('hidden');\\n                          dash.classList.remove('hidden');\\n                          dash.classList.add('fade-in');",
    "auth.classList.add('hidden');\\n                          dash.classList.remove('hidden');\\n                          dash.classList.add('fade-in');\\n                          const landing = document.getElementById('landingSection');\\n                          if(landing) landing.classList.add('hidden');"
);

fs.writeFileSync('index.html', html);
console.log('Fixed landing section hide for logged in users');
