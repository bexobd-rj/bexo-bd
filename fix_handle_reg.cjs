const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const regex = /const profileUid = 'BX-' \+ Math\.floor\(100000 \+ Math\.random\(\) \* 900000\);\s*\/\/ ALWAYS signUp for registration[\s\S]*?(?=\/\/ UI Transition)/;

const newLogic = `let profileUid = 'BX-' + Math.floor(100000 + Math.random() * 900000);
        let authUser = null;
        
        // Check if user is already authenticated via OTP in Step 1
        const { data: { session } } = await sb.auth.getSession();
        if (session && session.user && session.user.email === email) {
            authUser = session.user;
            
            // 1. Update auth.users with password and metadata
            const { error: updateError } = await sb.auth.updateUser({
                password: pass,
                data: {
                    fullName: name,
                    shopName: shop,
                    phone: phone,
                    address: addr,
                    referredBy: referredBy
                }
            });
            if (updateError) {
                if (btn) { btn.innerHTML = 'অ্যাকাউন্ট তৈরি করুন'; btn.disabled = false; }
                return showToast("পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে: " + updateError.message, "error");
            }
            
            // 2. Fetch existing profile to get the auto-generated profileId
            const { data: existingDbUser } = await sb.from('bexo_users').select('profileId').eq('id', authUser.id).maybeSingle();
            if (existingDbUser && existingDbUser.profileId) {
                profileUid = existingDbUser.profileId;
            }
            
            // 3. Update bexo_users explicitly since trigger only fires on INSERT
            await sb.from('bexo_users').update({
                fullName: name,
                shopName: shop,
                phone: phone,
                address: addr,
                referredBy: referredBy
            }).eq('id', authUser.id);
            
        } else {
            // Fallback: If not logged in, signUp
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
                authUser = authData.user;
            }
        }

        if (authUser) {
            // Successfully signed up or updated!
            const newProfile = {
                id: authUser.id,
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
            localStorage.setItem('bexo_profile_' + authUser.id, JSON.stringify(userProfile));
            localStorage.setItem('bexo_profile', JSON.stringify(userProfile));
            localStorage.setItem('bexo_active_uid', authUser.id);
            if (typeof saveProfile === 'function') saveProfile();
            if (typeof updateAppUsersList === 'function') updateAppUsersList(userProfile);
            
            showToast("অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।", "success");
            
            `;

code = code.replace(regex, newLogic);
fs.writeFileSync('public/app.js', code);
