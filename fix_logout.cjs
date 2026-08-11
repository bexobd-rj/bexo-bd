const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const logoutFunction = `
              function logout() {
                  if (window.firebaseAuth && window.signOut) {
                      window.signOut(window.firebaseAuth).then(() => {
                          userProfile = null;
                          localStorage.removeItem('bexo_profile');
                          window.location.reload();
                      }).catch((error) => {
                          console.error("Logout error", error);
                      });
                  } else {
                      userProfile = null;
                      localStorage.removeItem('bexo_profile');
                      window.location.reload();
                  }
              }
`;

html = html.replace('function switchMenu(menuKey) {', logoutFunction + '\n              function switchMenu(menuKey) {');
fs.writeFileSync('index.html', html);
console.log("Added logout function");
