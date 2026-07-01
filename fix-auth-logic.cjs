const fs = require('fs');

let js = fs.readFileSync('script.js', 'utf-8');

// Replace the window.addEventListener('load', () => { block to also hide landing
js = js.replace(
    "auth.classList.add('hidden');\n                      dash.classList.remove('hidden');",
    "auth.classList.add('hidden');\n                      dash.classList.remove('hidden');\n                      const landing = document.getElementById('landingSection');\n                      if(landing) landing.classList.add('hidden');"
);

// Also need to hide landing on successful login. Let's find login logic.
// search for: const dash = document.getElementById('dashboardSection'); after syncProfileWithGlobal();
js = js.replace(
    "const auth = document.getElementById('authSection');\n                  const dash = document.getElementById('dashboardSection');\n\n                  auth.classList.add('hidden');",
    "const auth = document.getElementById('authSection');\n                  const dash = document.getElementById('dashboardSection');\n                  const landing = document.getElementById('landingSection');\n                  if(landing) landing.classList.add('hidden');\n\n                  auth.classList.add('hidden');"
);

// Search for Direct Login UI Switch
js = js.replace(
    "const auth = document.getElementById('authSection');\n                      const dash = document.getElementById('dashboardSection');\n\n                      auth.classList.add('hidden');",
    "const auth = document.getElementById('authSection');\n                      const dash = document.getElementById('dashboardSection');\n                      const landing = document.getElementById('landingSection');\n                      if(landing) landing.classList.add('hidden');\n\n                      auth.classList.add('hidden');"
);

// On logout, should it go to landing or auth?
// Let's go to authSection (login), which is fine. But we might want to make sure landing is hidden if we want to show auth.
// Actually logout logic:
js = js.replace(
    "auth.classList.remove('hidden');\n                  dash.classList.add('hidden');",
    "auth.classList.remove('hidden');\n                  dash.classList.add('hidden');\n                  const landing = document.getElementById('landingSection');\n                  if(landing) landing.classList.add('hidden');"
);

fs.writeFileSync('script.js', js);
console.log('Fixed script.js login/logout logic');
