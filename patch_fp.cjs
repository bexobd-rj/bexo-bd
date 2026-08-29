const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const regex = /if \(matchedUser\) \{\s*matchedUser\.password = np;\s*matchedUser\.lastActive = new Date\(\)\.toISOString\(\);\s*const idx = appUsers\.findIndex[\s\S]*?window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);/m;

const replacementStr = `if (matchedUser) {
                                       matchedUser.password = np;
                                       matchedUser.lastActive = new Date().toISOString();
                                       
                                       const idx = appUsers.findIndex(u => u.profileId === matchedUser.profileId || (u.email && matchedUser.email && u.email.toLowerCase() === matchedUser.email.toLowerCase()));
                                       if (idx > -1) appUsers[idx] = matchedUser;
                                       else appUsers.push(matchedUser);

                                       if (typeof saveUsers === 'function') saveUsers(matchedUser.profileId);
                                   }

                                  modal.remove();
                                  showToast("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! দয়া করে লগইন করুন।", "success");
                                  
                                  // Sign out of Supabase to prevent ghost sessions
                                  const sb = window.getSupabase ? window.getSupabase() : null;
                                  if (sb && sb.auth) {
                                      await sb.auth.signOut().catch(()=>{});
                                  }

                                  // Do not auto-login. Just go to login screen.
                                  const auth = document.getElementById('authSection');
                                  const dash = document.getElementById('dashboardSection');
                                  var landing = document.getElementById('landingSection');
                                  if(landing) landing.classList.add('hidden');
                                  if(dash) dash.classList.add('hidden');
                                  if(auth) auth.classList.remove('hidden');
                                  if (typeof toggleAuth === 'function') toggleAuth(true); // switch to login form
                                  window.scrollTo({ top: 0, behavior: 'smooth' });`;

if (regex.test(code)) {
    code = code.replace(regex, replacementStr);
    fs.writeFileSync('public/app.js', code);
    console.log("Success: Replaced forgot password auto-login");
} else {
    console.log("Error: Target string not found.");
}
