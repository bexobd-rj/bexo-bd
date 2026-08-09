const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldLoginSessionRegex = /function loginSession\(\)\s*\{[\s\S]*?if \(!foundUser\)/;

const newLoginSession = `function loginSession() {
                  const phoneField = document.getElementById('loginPhone'); // Using loginPhone ID but acts as email
                  const passField = document.getElementById('loginPass');
                  const alertBox = document.getElementById('loginAlert');
                  const alertMsg = document.getElementById('loginAlertMsg');
                  const successBox = document.getElementById('loginSuccessAlert');

                  if(successBox) successBox.classList.add('hidden');

                  const phone = phoneField.value.trim(); // actually email
                  let pass = passField.value.trim();

                  // Standardize any Bangla numerals to English in password
                  const bMap = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
                  pass = pass.replace(/[০-৯]/g, d => bMap[d] || d);

                  let foundUser = null;

                  // Check against appUsers database for matching lowercase emails
                  foundUser = appUsers.find(u => {
                      const dbPass = String(u.password || '').trim().replace(/[০-৯]/g, d => bMap[d] || d);
                      const isEmailMatch = u.email && phone && (u.email.toLowerCase().trim() === phone.toLowerCase().trim());
                      
                      return isEmailMatch && dbPass === pass;
                  });

                  if (!foundUser)`;

html = html.replace(oldLoginSessionRegex, newLoginSession);

fs.writeFileSync('index.html', html);
console.log('Modified loginSession');
