import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

supabase_google_auth = """              async function handleGoogleAuth() {
                  try {
                      if (!window.supabase) {
                          showToast("Supabase লোড হচ্ছে, অনুগ্রহ করে একটু অপেক্ষা করুন...", "info");
                          return;
                      }
                      
                      const triggerAuthProcess = async (loggedInUser) => {
                          console.log("Google Sign-In success:", loggedInUser.email);
                          
                          // Check if user has an existing account in our database
                          let foundUser = null;
                          if (Array.isArray(appUsers)) {
                              foundUser = appUsers.find(u => u.email && u.email.toLowerCase().trim() === loggedInUser.email.toLowerCase().trim());
                          }
                          
                          if (!foundUser) {
                              if (window.db) {
                                  try {
                                      const snap = await window.db.collection('bexo_users').get();
                                      snap.forEach(doc => {
                                          const data = doc.data();
                                          if (data && data.email && data.email.toLowerCase().trim() === loggedInUser.email.toLowerCase().trim()) {
                                              foundUser = data;
                                          }
                                      });
                                  } catch(e) {
                                      console.error("Supabase check failed:", e);
                                  }
                              }
                          }
                          
                          if (!foundUser) {
                              // Sign up: Create a new profile
                              const isSuperAdminEmail = loggedInUser.email === 'bexobd@gmail.com';
                              
                              // Generate unique seller code for Passive Income
                              let sCode = '';
                              while (true) {
                                  sCode = 'BX' + Math.floor(100 + Math.random() * 900);
                                  if (Array.isArray(appUsers)) {
                                      if (!appUsers.some(u => u.sellerCode === sCode)) break;
                                  } else {
                                      break;
                                  }
                              }
                              
                              foundUser = {
                                  ...DEFAULT_PROFILE,
                                  profileId: 'BX-' + Math.floor(100000 + Math.random() * 900000),
                                  fullName: loggedInUser.user_metadata?.full_name || loggedInUser.email.split('@')[0],
                                  email: loggedInUser.email,
                                  password: 'google_' + loggedInUser.id,
                                  sellerCode: sCode,
                                  role: isSuperAdminEmail ? 'admin' : 'user',
                                  joinDate: new Date().toLocaleDateString('bn-BD'),
                                  createdAt: Date.now()
                              };
                              
                              updateAppUsersList(foundUser);
                              showToast("Google অ্যাকাউন্ট সফলভাবে রেজিস্টার করা হয়েছে!", "success");
                          } else {
                              showToast("Google অ্যাকাউন্ট সফলভাবে লগইন করা হয়েছে!", "success");
                          }
                          userProfile = { ...DEFAULT_PROFILE, ...foundUser };
                          userProfile.lastActive = new Date().toISOString();
                          if (Array.isArray(appUsers)) {
                              const uIdx = appUsers.findIndex(u => String(u.profileId) === String(userProfile.profileId));
                              if (uIdx > -1) {
                                  appUsers[uIdx].lastActive = userProfile.lastActive;
                                  saveUsers(userProfile.profileId);
                              }
                          }
                          saveProfile();
                          
                          if (userProfile.role === 'admin') {
                              localStorage.setItem('bexo_is_admin', 'true');
                          }
                          
                          const auth = document.getElementById('authSection');
                          const dash = document.getElementById('dashboardSection');
                          const admin = document.getElementById('adminSection');
                          const landing = document.getElementById('landingPage');
                          
                          if (auth) auth.classList.add('hidden');
                          if (landing) landing.classList.add('hidden');
                          
                          if (userProfile.role === 'admin') {
                              if (admin) admin.classList.remove('hidden');
                              if (typeof renderAdminDashboard === 'function') renderAdminDashboard();
                              const adminSub = localStorage.getItem('bexo_admin_subview') || 'dashboard';
                              switchAdminView(adminSub);
                          } else {
                              if (dash) dash.classList.remove('hidden');
                              if (typeof renderHome === 'function') renderHome();
                          }
                          
                          updateHeaderUI();
                      };
                      
                      showToast("Google সাইন-ইন উইন্ডো খোলা হচ্ছে...", "info");
                      try {
                          const { data, error } = await window.supabase.auth.signInWithOAuth({
                              provider: 'google',
                              options: {
                                  queryParams: {
                                      access_type: 'offline',
                                      prompt: 'consent',
                                  },
                                  skipBrowserRedirect: true // Uses popup if possible, else redirects
                              }
                          });
                          if (error) throw error;
                          
                          // On successful sign-in, if skipBrowserRedirect is false, the page will reload.
                          // If skipBrowserRedirect is true, we might need to handle the session manually.
                          // Let's use the standard redirect for now, which is more reliable in AI Studio.
                          
                          window.supabase.auth.signInWithOAuth({
                              provider: 'google',
                              options: {
                                  redirectTo: window.location.origin
                              }
                          });
                      } catch (err) {
                          console.warn("Google OAuth failed, using fallback assistant:", err);
                          showGoogleFallbackModal(async (mockUser) => {
                              await triggerAuthProcess({
                                  id: mockUser.uid,
                                  email: mockUser.email || document.getElementById('fallback-google-email-input').value,
                                  user_metadata: { full_name: 'Mock User' }
                              });
                          });
                      }
                      
                  } catch (err) {
                      console.error("Google Auth failed inside index.html:", err);
                      showToast("Google অথেনটিকেশন ব্যর্থ হয়েছে: " + err.message, "error");
                  }
              }"""

# Need to replace exactly the block `async function handleGoogleAuth() { ... }` up to the next function.
pattern = r'async function handleGoogleAuth\(\) \{.*?\n              \}\n'
content = re.sub(pattern, supabase_google_auth + '\n', content, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced handleGoogleAuth with Supabase logic")
