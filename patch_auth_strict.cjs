const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Patch Registration Check
const regRegex = /const existingEmail = appUsers\.find\(u => u\.email && u\.email\.toLowerCase\(\)\.trim\(\) === email\.toLowerCase\(\)\.trim\(\)\);\s*if \(existingEmail\) \{\s*showToast\("এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error", 6000\);\s*return;\s*\}/m;

const regReplacement = `// Checking Supabase directly for registration
    const sb = window.getSupabase();
    if (!sb || !sb.auth) {
        return alert("Supabase is not initialized. Please configure it.");
    }
    try {
        const { data: existDb, error: existErr } = await sb.from('bexo_users').select('email').eq('email', email.toLowerCase()).maybeSingle();
        if (existDb) {
            showToast("এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error", 6000);
            return;
        }
    } catch (e) {
        console.warn("Direct check failed", e);
    }`;

code = code.replace(regRegex, regReplacement);

// 2. Patch handleLogin to be strictly Supabase
const loginRegexStart = /async function handleLogin\(\) \{[\s\S]*?window\._lastAuthError = null;/m;
// I'll replace the whole handleLogin by matching from `async function handleLogin()` to `window.handleLogin = function(e)`
const loginFullRegex = /async function handleLogin\(\) \{[\s\S]*?window\.handleLogin = function\(e\)/m;

const loginFullReplacement = `async function handleLogin() {
    window._lastAuthError = null;
    const identifierEl = document.getElementById('loginIdentifier');
    const passEl = document.getElementById('loginPass');
    const btn = document.getElementById('btnLoginSubmit');
    if (!identifierEl || !passEl) return showToast('সব তথ্য দিন', 'error');

    const rawIdentifier = identifierEl.value.trim();
    const rawPass = passEl.value;
    if (!rawIdentifier || !rawPass) return showToast('সব তথ্য দিন', 'error');

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> অপেক্ষা করুন...';
    btn.disabled = true;

    const bMap = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
    const cleanPass = String(rawPass).trim().replace(/[০-৯]/g, d => bMap[d] || d);
    let cleanIdentifier = String(rawIdentifier).trim().replace(/[০-৯]/g, d => bMap[d] || d);
    const isEmail = cleanIdentifier.includes('@');

    const sb = window.getSupabase ? window.getSupabase() : null;
    if (!sb || !sb.auth) {
        showToast('Supabase ক্লাউড ডাটাবেজ কনফিগার করা নেই।', 'error');
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> প্রবেশ করুন';
        btn.disabled = false;
        return;
    }

    const creds = { password: cleanPass };
    if (isEmail) {
        creds.email = cleanIdentifier;
    } else {
        // Find email by phone from Supabase
        try {
            const { data: dbUser } = await sb.from('bexo_users').select('email').eq('phone', cleanIdentifier).maybeSingle();
            if (dbUser && dbUser.email) {
                creds.email = dbUser.email;
            } else {
                creds.phone = cleanIdentifier;
            }
        } catch(e) {
            creds.phone = cleanIdentifier;
        }
    }

    try {
        const { data, error } = await sb.auth.signInWithPassword(creds);
        if (error) {
            console.warn('Supabase auth login exception:', error.message);
            window._lastAuthError = error.message;
            if (error.message.includes("Invalid login credentials")) {
                showToast('লগইন ব্যর্থ: অ্যাকাউন্ট পাওয়া যায়নি বা পাসওয়ার্ড ভুল', 'error');
            } else {
                showToast('লগইন ব্যর্থ: ' + error.message, 'error');
            }
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> প্রবেশ করুন';
            btn.disabled = false;
            return;
        }

        if (data && data.user) {
            const activeUid = data.user.id;
            localStorage.setItem('bexo_active_uid', activeUid);

            // Fetch authoritative profile
            const { data: dbUser, error: dbErr } = await sb.from('bexo_users').select('*').eq('id', activeUid).maybeSingle();
            
            if (dbUser) {
                dbUser.lastActive = new Date().toISOString();
                userProfile = normalizeProfile(dbUser);
                localStorage.setItem('bexo_profile_' + activeUid, JSON.stringify(userProfile));
                localStorage.setItem('bexo_profile', JSON.stringify(userProfile));
                
                showToast('সফলভাবে লগইন হয়েছে!', 'success');

                if (userProfile.email === 'bexobd@gmail.com') {
                    localStorage.setItem('bexo_is_admin', 'true');
                    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> প্রবেশ করুন';
                    btn.disabled = false;
                    
                    const authSection = document.getElementById('authSection');
                    const dashboardSection = document.getElementById('dashboardSection');
                    const landingSection = document.getElementById('landingSection');
                    const adminSec = document.getElementById('adminSection');
                    
                    if (landingSection) landingSection.classList.add('hidden');
                    if (authSection) authSection.classList.add('hidden');
                    if (dashboardSection) dashboardSection.classList.add('hidden');
                    
                    if (adminSec) {
                        currentMenu = 'admin';
                        adminSec.classList.remove('hidden');
                        adminSec.style.display = 'flex';
                        adminSec.style.zIndex = '9999';
                        setTimeout(() => {
                            if (typeof switchAdminSubView === 'function') switchAdminSubView('dashboard');
                            if (typeof updateAdminStats === 'function') updateAdminStats();
                        }, 100);
                    }
                } else {
                    localStorage.setItem('bexo_is_admin', 'false');
                    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> প্রবেশ করুন';
                    btn.disabled = false;
                    const authSection = document.getElementById('authSection');
                    const dashboardSection = document.getElementById('dashboardSection');
                    const landingSection = document.getElementById('landingSection');
                    if (landingSection) landingSection.classList.add('hidden');
                    if (authSection) authSection.classList.add('hidden');
                    if (dashboardSection) {
                        dashboardSection.classList.remove('hidden');
                        dashboardSection.classList.add('fade-in');
                    }
                    if (typeof renderHome === 'function') renderHome();
                }
                
                if (typeof updateHeaderUI === 'function') updateHeaderUI();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            } else {
                // User logged in auth but NO profile found in bexo_users table
                showToast('লগইন ব্যর্থ: ডাটাবেজে আপনার অ্যাকাউন্ট পাওয়া যায়নি (Data Missing)।', 'error');
                sb.auth.signOut();
                btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> প্রবেশ করুন';
                btn.disabled = false;
                return;
            }
        }
    } catch (e) {
        console.warn('Supabase login error', e);
        showToast('লগইন ব্যর্থ: সার্ভার এরর', 'error');
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> প্রবেশ করুন';
        btn.disabled = false;
    }
}

window.handleLogin = function(e)`;

code = code.replace(loginFullRegex, loginFullReplacement);

// Also remove from completeRegistration (which we probably don't need to touch right now, but just checking)

fs.writeFileSync('public/app.js', code);
console.log("Success: Cleaned up Auth to rely strictly on Supabase");
