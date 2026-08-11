const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// We need to inject the auth state listener right after Firebase initialization.
const firebaseInitRegex = /window\.onAuthStateChanged = onAuthStateChanged;/;

const authStateListener = `window.onAuthStateChanged = onAuthStateChanged;

                      // Source of Truth: Listen to Firebase Auth State
                      onAuthStateChanged(window.firebaseAuth, async (user) => {
                          if (user) {
                              try {
                                  const docRef = window.db.collection('bexo_users').doc(user.uid);
                                  const snap = await docRef.get();
                                  if (snap.exists) {
                                      const data = snap.data();
                                      
                                      // Check if user is banned
                                      if (data.isBanned === true) {
                                          window.signOut(window.firebaseAuth);
                                          showToast("আপনার অ্যাকাউন্টটি প্রশাসনিক কারণে স্থগিত (Banned) করা হয়েছে।", "error");
                                          userProfile = null;
                                          localStorage.removeItem('bexo_profile');
                                          return;
                                      }

                                      userProfile = { ...DEFAULT_PROFILE, ...data };
                                      userProfile.lastActive = new Date().toISOString();
                                      localStorage.setItem('bexo_profile', JSON.stringify(userProfile));
                                      
                                      // Update appUsers list if missing
                                      const existingIdx = appUsers.findIndex(u => u.profileId === data.profileId);
                                      if (existingIdx > -1) {
                                          appUsers[existingIdx] = userProfile;
                                      } else {
                                          appUsers.push(userProfile);
                                      }
                                      
                                      // Auto-login to dashboard
                                      const authSection = document.getElementById('authSection');
                                      const dashSection = document.getElementById('dashboardSection');
                                      const landingSection = document.getElementById('landingSection');
                                      if (authSection) authSection.classList.add('hidden');
                                      if (landingSection) landingSection.classList.add('hidden');
                                      if (dashSection) {
                                          dashSection.classList.remove('hidden');
                                          dashSection.classList.add('fade-in');
                                      }
                                      renderHome();
                                      updateHeaderBalance();
                                  } else {
                                      // User exists in auth but no profile in Firestore? Log them out.
                                      window.signOut(window.firebaseAuth);
                                      userProfile = null;
                                      localStorage.removeItem('bexo_profile');
                                  }
                              } catch (e) {
                                  console.error("Error fetching user profile:", e);
                              }
                          } else {
                              // User is logged out
                              userProfile = null;
                              localStorage.removeItem('bexo_profile');
                              // Do not force show auth section here to allow landing page to be visible
                          }
                      });`;
html = html.replace(firebaseInitRegex, authStateListener);
fs.writeFileSync('index.html', html);
console.log("Injected auth state listener.");
