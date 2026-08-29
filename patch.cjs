const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// Fix 1: showRegOtpModal
code = code.replace(/function showRegOtpModal\(\) \{[\s\S]*?function verifyRegOtp/m, `async function showRegOtpModal() {
    const emailField = document.getElementById('regEmail');
    const email = emailField.value.trim();
    if (!email) return alert('দয়া করে আপনার ইমেইল দিন');

    const existingEmail = appUsers.find(u => u.email && u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (existingEmail) {
        showToast("এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error", 6000);
        return;
    }

    const formBtn = document.querySelector('#regStep1Form button[type="submit"]');
    if (formBtn) {
        formBtn.disabled = true;
        formBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> পাঠানো হচ্ছে...';
    }

    const sb = window.getSupabase();
    if (!sb || !sb.auth) {
        if (formBtn) {
            formBtn.disabled = false;
            formBtn.innerHTML = 'ভেরিফিকেশন কোড পাঠান <i class="fas fa-arrow-right"></i>';
        }
        return alert("Supabase is not initialized.");
    }

    // Since we want to use signUp for proper user creation with password later, we can't easily use signUp without password here.
    // We will use signInWithOtp which sends a magic link / OTP. For new users, it creates them.
    const { error } = await sb.auth.signInWithOtp({
        email: email,
        options: { shouldCreateUser: true }
    });

    if (formBtn) {
        formBtn.disabled = false;
        formBtn.innerHTML = 'ভেরিফিকেশন কোড পাঠান <i class="fas fa-arrow-right"></i>';
    }

    if (error) {
        return alert("OTP Sending failed: " + error.message);
    }

    let modal = document.getElementById('reg-otp-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'reg-otp-modal';
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] fade-in';
    modal.innerHTML = \`
        <div class="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 relative shadow-2xl">
            <button type="button" onclick="document.getElementById('reg-otp-modal').remove()" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 hover:text-slate-800 transition-colors">
                <i class="fas fa-times"></i>
            </button>
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-envelope-open-text text-2xl"></i>
                </div>
                <h3 class="text-xl font-bold text-slate-800 tracking-tight">ইমেইল ভেরিফিকেশন</h3>
                <p class="text-sm text-slate-500 mt-2">আমরা <strong>\${email}</strong> এ একটি ৬-ডিজিটের কোড পাঠিয়েছি।</p>
            </div>
            <div class="mb-6">
                <input type="text" id="regOtpCode" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-2xl tracking-[0.5em] text-center font-black rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 block px-4 py-4" placeholder="------" maxlength="6" required>
            </div>
            <button type="button" onclick="verifyRegOtp('\${email}')" id="regBtnVerify" class="w-full text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 font-bold rounded-xl text-base sm:text-lg px-5 py-4 text-center shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2">
                ভেরিফাই করুন <i class="fas fa-check-circle"></i>
            </button>
        </div>
    \`;
    document.body.appendChild(modal);
}

function verifyRegOtp`);

// Fix 2: handleRegister (use updateUser instead of signUp if they are already logged in)
code = code.replace(/try \{\s+const \{ data: authData, error: authError \} = await sb\.auth\.signUp\(\{[\s\S]*?\}\);/m, `try {
                                const { data: authData, error: authError } = await sb.auth.updateUser({
                                    password: pass,
                                    data: {
                                        fullName: name,
                                        shopName: shop,
                                        phone: phone,
                                        address: addr,
                                        referredBy: referredBy,
                                        profileId: profileUid
                                    }
                                });`);

fs.writeFileSync('public/app.js', code);
