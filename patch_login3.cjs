const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const regex = /if \(!window\.supabase && matchedUser && matchedUser\.password\) \{/;
// wait, I replaced this regex earlier in patch_login.cjs.

const regex2 = /if \(matchedUser && !localPassMatch\) \{\s*showToast\('লগইন ব্যর্থ: পাসওয়ার্ড ভুল প্রদান করেছেন!', 'error'\);\s*\} else \{\s*showToast\('লগইন ব্যর্থ: Invalid login credentials', 'error'\);\s*\}/m;

const replacementStr2 = `if (matchedUser && !localPassMatch) {
                       showToast('লগইন ব্যর্থ: পাসওয়ার্ড ভুল প্রদান করেছেন!', 'error');
                   } else {
                       if (window._lastAuthError) {
                           showToast('লগইন ব্যর্থ: ' + window._lastAuthError, 'error');
                       } else {
                           showToast('লগইন ব্যর্থ: অ্যাকাউন্ট পাওয়া যায়নি বা পাসওয়ার্ড ভুল', 'error');
                       }
                   }`;

const regex3 = /console\.warn\('Supabase auth login failed:', error\?\.message\);/g;
const replacementStr3 = `window._lastAuthError = error?.message; console.warn('Supabase auth login failed:', error?.message);`;

const regex4 = /console\.warn\('Supabase auth login exception:', e\);/g;
const replacementStr4 = `window._lastAuthError = e?.message || e; console.warn('Supabase auth login exception:', e);`;


code = code.replace(regex2, replacementStr2);
code = code.replace(regex3, replacementStr3);
code = code.replace(regex4, replacementStr4);

// Initialize window._lastAuthError = null at the start of handleLogin
code = code.replace(/window\.handleLogin = handleLogin;/g, `window.handleLogin = function(e) { window._lastAuthError = null; handleLogin(e); };`);

fs.writeFileSync('public/app.js', code);
console.log("Success: Patched handleLogin error messages");
