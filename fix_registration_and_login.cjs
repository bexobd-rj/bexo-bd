const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Rewrite handleRegister
const regRegex = /async function handleRegister\(\) \{[\s\S]*?completeRegistration\(newProfile\);\s*\}\s*catch \([^)]+\) \{\s*console\.error[^}]+\}\s*\}/m;
const regReplacement = `async function handleRegister() {
    try {
        const shopField = document.getElementById('regShop');
        const nameField = document.getElementById('regName');
        const phoneField = document.getElementById('regPhone');
        const emailField = document.getElementById('regEmail');
        const addrField = document.getElementById('regAddress');
        const passField = document.getElementById('regPass');
        const confirmField = document.getElementById('regConfirmPass');
        const refCodeField = document.getElementById('regReferral');
        const termsField = document.getElementById('terms');

        if (!shopField || !nameField || !phoneField || !passField || !termsField) {
            throw new Error("Required registration fields missing in DOM");
        }

        const shop = shopField.value.trim();
        const name = nameField.value.trim();
        
        let phone = phoneField.value.trim();
        let pass = passField.value;
        let confirm = confirmField ? confirmField.value : '';
        const bMap = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
        phone = phone.replace(/[০-৯]/g, d => bMap[d] || d);
        pass = pass.replace(/[০-৯]/g, d => bMap[d] || d);
        confirm = confirm.replace(/[০-৯]/g, d => bMap[d] || d);
        phone = typeof normalizePhone === 'function' ? normalizePhone(phone) : phone;

        const email = emailField ? emailField.value.trim() : '';
        const addr = addrField ? addrField.value.trim() : '';
        const refCode = refCodeField ? refCodeField.value.trim() : '';
        const terms = termsField.checked;

        if (!terms) return showToast("শর্তাবলীতে রাজি হতে হবে!", "error");
        if(!shop || !name || !phone || !addr || !pass || !email) return showToast("সবগুলো তথ্য সঠিকভাবে পূরণ করুন এবং অবশ্যই ইমেইল প্রদান করুন!", "error");
        if (phone.length !== 11 || !phone.startsWith('01')) return showToast("অনুগ্রহ করে একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)!", "error");
        if(pass !== confirm) return showToast("পাসওয়ার্ড ম্যাচ করেনি!", "error");
        if(pass.length < 6) return showToast("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!", "error");

        const sb = window.getSupabase ? window.getSupabase() : null;
        if (!sb || !sb.auth) return showToast("সুপারবেজ ডাটাবেজ সংযুক্ত নয়।", "error");

        const btn = document.querySelector('#registerForm button[type="submit"]');
        if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> অপেক্ষা করুন...'; btn.disabled = true; }

        // Passive Income: Referral Logic
        let referredBy = null;
        if (refCode) {
            if (typeof findReferrerByCode === 'function') {
                const referrer = findReferrerByCode(refCode);
                if (referrer) referredBy = referrer.profileId;
                else {
                    if (btn) { btn.innerHTML = 'অ্যাকাউন্ট তৈরি করুন'; btn.disabled = false; }
                    return showToast("ভুল রেফারেল কোড!", "error");
                }
            }
        }

        const profileUid = 'BX-' + Math.floor(100000 + Math.random() * 900000);

        // ALWAYS signUp for registration
        const { data: authData, error: authError } = await sb.auth.signUp({
            email: email,
            password: pass,
            options: {
                data: {
                    fullName: name,
                    shopName: shop,
                    phone: phone,
                    address: addr,
                    referredBy: referredBy,
                    profileId: profileUid
                }
            }
        });

        if (authError) {
            console.warn("Supabase Auth signUp error:", authError.message);
            if (btn) { btn.innerHTML = 'অ্যাকাউন্ট তৈরি করুন'; btn.disabled = false; }
            if (authError.message.includes("User already registered")) {
                showToast("এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error", 6000);
            } else {
                showToast("রেজিস্ট্রেশন ব্যর্থ: " + authError.message, "error");
            }
            return;
        }

        if (authData && authData.user) {
            // Successfully signed up!
            const newProfile = {
                id: authData.user.id,
                profileId: profileUid,
                shopName: shop,
                fullName: name,
                phone: phone,
                email: email,
                address: addr,
                referredBy: referredBy,
                password: pass,
                joinDate: new Date().toLocaleDateString('bn-BD'),
                createdAt: Date.now()
            };
            
            userProfile = typeof normalizeProfile === 'function' ? normalizeProfile(newProfile) : newProfile;
            localStorage.setItem('bexo_profile_' + authData.user.id, JSON.stringify(userProfile));
            localStorage.setItem('bexo_profile', JSON.stringify(userProfile));
            localStorage.setItem('bexo_active_uid', authData.user.id);
            if (typeof saveProfile === 'function') saveProfile();
            if (typeof updateAppUsersList === 'function') updateAppUsersList(userProfile);
            
            showToast("অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।", "success");
            
            // UI Transition
            if (btn) { btn.innerHTML = 'অ্যাকাউন্ট তৈরি করুন'; btn.disabled = false; }
            const authSection = document.getElementById('authSection');
            const dashboardSection = document.getElementById('dashboardSection');
            if (authSection && dashboardSection) {
                authSection.classList.add('hidden');
                dashboardSection.classList.remove('hidden');
                dashboardSection.classList.add('fade-in');
                const landing = document.getElementById('landingSection');
                if (landing) landing.classList.add('hidden');
                if (typeof renderHome === 'function') renderHome();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    } catch (error) {
        console.error("Registration Error:", error);
        showToast("অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে! আবার চেষ্টা করুন।", "error");
        const btn = document.querySelector('#registerForm button[type="submit"]');
        if (btn) { btn.innerHTML = 'অ্যাকাউন্ট তৈরি করুন'; btn.disabled = false; }
    }
}`;

code = code.replace(regRegex, regReplacement);

fs.writeFileSync('public/app.js', code);
console.log("Registration logic completely replaced and fixed!");
