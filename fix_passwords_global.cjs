const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace saveUsers
const newSaveUsers = `function saveUsers(userIdToSync = null, skipFirestore = false) {
                  localStorage.setItem('bexo_users', JSON.stringify(appUsers));
                  if (window.db && !skipFirestore) {
                      if (userIdToSync) {
                          const idsToSync = Array.isArray(userIdToSync) ? userIdToSync : [userIdToSync];
                          idsToSync.forEach(id => {
                              const target = appUsers.find(u => String(u.profileId) === String(id));
                              if (target && target.profileId) {
                                  const docId = target.uid ? String(target.uid) : String(target.profileId);
                                  window.db.collection('bexo_users').doc(docId).set(sanitizeForFirestore(target))
                                      .catch(err => console.error("Firebase sync specific user error:", err));
                              }
                          });
                      } else {
                          if (isUserAdmin()) {
                              appUsers.forEach(u => {
                                  if (u && u.profileId) {
                                      const docId = u.uid ? String(u.uid) : String(u.profileId);
                                      window.db.collection('bexo_users').doc(docId).set(sanitizeForFirestore(u))
                                          .catch(err => console.error("Firebase sync user error:", err));
                                  }
                              });
                          } else if (userProfile && userProfile.profileId) {
                              const target = appUsers.find(u => String(u.profileId) === String(userProfile.profileId));
                              if (target && target.profileId) {
                                  const docId = target.uid ? String(target.uid) : String(target.profileId);
                                  window.db.collection('bexo_users').doc(docId).set(sanitizeForFirestore(target))
                                      .catch(err => console.error("Firebase regular user sync error:", err));
                              }
                           }
                      }
                  }
              }`;
const regex = /function saveUsers\(userIdToSync = null, skipFirestore = false\) \{[\s\S]*?\}\s*(?=\n\s*let appAccounts)/;
html = html.replace(regex, newSaveUsers);
fs.writeFileSync('index.html', html);
console.log("Fixed saveUsers");
