const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');
const target = `    // Bypassing local/db email check so users can re-sync Auth if needed
    // The OTP process will handle actual authentication.`;
const replacement = `    // Check if email already exists in bexo_users to prevent duplicate registration
    try {
        const { data: existingUser } = await sb.from('bexo_users').select('email').eq('email', email.toLowerCase()).maybeSingle();
        if (existingUser) {
            return showToast("এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error", 6000);
        }
    } catch(e) { console.warn(e); }
    
    // Bypassing local/db email check so users can re-sync Auth if needed
    // The OTP process will handle actual authentication.`;
code = code.replace(target, replacement);
fs.writeFileSync('public/app.js', code);
