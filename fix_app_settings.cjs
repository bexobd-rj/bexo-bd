const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const declarations = `
              let appSettings = JSON.parse(localStorage.getItem('bexo_settings')) || {
                  notice: '',
                  scrollingHeadline: '',
                  sliders: [],
                  refJoiningBonus: 50,
                  minWithdraw: 500,
                  insideDhakaCharge: 60,
                  outsideDhakaCharge: 120,
                  apiIntegration: {}
              };
              let appCustomerReports = JSON.parse(localStorage.getItem('bexo_customer_reports')) || [];

              function saveAppSettings() {
                  localStorage.setItem('bexo_settings', JSON.stringify(appSettings));
                  if (window.db) {
                      window.db.collection('bexo_settings').doc('global').set(appSettings)
                          .catch(err => console.error("Firebase sync settings error:", err));
                  }
              }

              function saveSettings() {
                  saveAppSettings();
              }

              function saveCustomerReports() {
                  localStorage.setItem('bexo_customer_reports', JSON.stringify(appCustomerReports));
              }
`;

// Insert after `let appPosts`
html = html.replace("let appPosts = JSON.parse(localStorage.getItem('bexo_posts')) || [];", "let appPosts = JSON.parse(localStorage.getItem('bexo_posts')) || [];" + declarations);

fs.writeFileSync('index.html', html);
console.log("Added appSettings and appCustomerReports");
