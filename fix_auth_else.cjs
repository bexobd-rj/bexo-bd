const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldElse = `} else {
                              // User is logged out
                              userProfile = null;
                              localStorage.removeItem('bexo_profile');
                              // Do not force show auth section here to allow landing page to be visible
                          }`;

const newElse = `} else {
                              // User is logged out
                              userProfile = null;
                              localStorage.removeItem('bexo_profile');
                              
                              const dashSection = document.getElementById('dashboardSection');
                              const landingSection = document.getElementById('landingSection');
                              const authSection = document.getElementById('authSection');
                              
                              if (dashSection && !dashSection.classList.contains('hidden')) {
                                  dashSection.classList.add('hidden');
                                  if (landingSection) {
                                      landingSection.classList.remove('hidden');
                                  } else if (authSection) {
                                      authSection.classList.remove('hidden');
                                  }
                              }
                          }`;

html = html.replace(oldElse, newElse);
fs.writeFileSync('index.html', html);
console.log("Fixed auth else");
