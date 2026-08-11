const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldSync = `// Real-time synchronization for currently logged-in user
                              if (userProfile && (
                                  (fUser.profileId && String(userProfile.profileId) === String(fUser.profileId)) ||
                                  (fUser.phone && userProfile.phone === fUser.phone)
                              )) {
                                  userProfile = { ...userProfile, ...fUser };
                                  localStorage.setItem('bexo_profile', JSON.stringify(userProfile));
                                  updateHeaderBalance();
                                  
                                  // Re-render user-facing financial screens if active
                                  if (typeof currentMenu === 'string') {`;

const newSync = `// Real-time synchronization for currently logged-in user
                              if (userProfile && (
                                  (fUser.profileId && String(userProfile.profileId) === String(fUser.profileId)) ||
                                  (fUser.phone && userProfile.phone === fUser.phone)
                              )) {
                                  userProfile = { ...userProfile, ...fUser };
                                  
                                  if (userProfile.isBanned === true) {
                                      showToast("আপনার অ্যাকাউন্টটি প্রশাসনিক কারণে স্থগিত (Banned) করা হয়েছে।", "error");
                                      if (typeof logout === 'function') logout();
                                      return;
                                  }

                                  localStorage.setItem('bexo_profile', JSON.stringify(userProfile));
                                  updateHeaderBalance();
                                  
                                  // Re-render user-facing financial screens if active
                                  if (typeof currentMenu === 'string') {`;

html = html.replace(oldSync, newSync);
fs.writeFileSync('index.html', html);
console.log("Fixed ban realtime logout");
