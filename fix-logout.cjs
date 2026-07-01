const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

const oldLogout = `              function logout() {
                  // Clear sessions
                  localStorage.removeItem('bexo_profile');
                  localStorage.removeItem('bexo_is_admin');
                  userProfile = { ...DEFAULT_PROFILE };
                  
                  const auth = document.getElementById('authSection');
                  const dash = document.getElementById('dashboardSection');
                  const admin = document.getElementById('adminSection');

                  const landing = document.getElementById('landingSection'); if(landing) { landing.classList.remove('hidden'); auth.classList.add('hidden'); } else { auth.classList.remove('hidden'); }
                  dash.classList.add('hidden');
                  const landing = document.getElementById('landingSection');
                  if(landing) landing.classList.add('hidden');
                  admin.classList.add('hidden');

                  // Explicitly show login form, hide registration
                  toggleAuth(true);`;

const newLogout = `              function logout() {
                  // Clear sessions
                  localStorage.removeItem('bexo_profile');
                  localStorage.removeItem('bexo_is_admin');
                  userProfile = { ...DEFAULT_PROFILE };
                  
                  const auth = document.getElementById('authSection');
                  const dash = document.getElementById('dashboardSection');
                  const admin = document.getElementById('adminSection');
                  const landing = document.getElementById('landingSection');

                  if (landing) {
                      landing.classList.remove('hidden');
                      auth.classList.add('hidden');
                  } else {
                      auth.classList.remove('hidden');
                  }
                  
                  dash.classList.add('hidden');
                  admin.classList.add('hidden');

                  // Explicitly show login form, hide registration
                  toggleAuth(true);`;

html = html.replace(oldLogout, newLogout);
fs.writeFileSync('index.html', html);
console.log('Fixed logout function syntax error');
