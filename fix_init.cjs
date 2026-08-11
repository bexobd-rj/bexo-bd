const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldInit = `// --- Initialization ---
              window.addEventListener('load', () => {
                  if (userProfile && userProfile.phone && userProfile.password) {
                      const auth = document.getElementById('authSection');
                      const dash = document.getElementById('dashboardSection');
                      if (auth && dash) {
                          auth.classList.add('hidden');
                          dash.classList.remove('hidden');
                          var landing = document.getElementById('landingSection');
                          if(landing) landing.classList.add('hidden');
                      }
                  }
                  renderHome();
                  updateCartCount();
                  updateHeaderBalance();
              });`;

const newInit = `// --- Initialization ---
              window.addEventListener('load', () => {
                  // UI Transition is now handled exclusively by Firebase Auth onAuthStateChanged listener.
                  // Only render the common elements initially
                  renderHome();
                  updateCartCount();
                  updateHeaderBalance();
              });`;

html = html.replace(oldInit, newInit);
fs.writeFileSync('index.html', html);
console.log("Fixed initialization");
